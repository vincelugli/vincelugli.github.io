import axios from "axios";

const mockUpdate = jest.fn();
const mockGet = jest.fn();
const mockSet = jest.fn((...args: any[]) => {
  const data = (args[0] && typeof args[0] === "object" && ("collection" in args[0] || "get" in args[0] || "doc" in args[0] || "path" in args[0])) ?
    args[1] :
    args[0];
  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        throw new Error(
          `Value for argument "data" is not a valid Firestore document. Cannot use "undefined" as a Firestore value (found in field "${key}").`
        );
      }
    }
  }
});
const mockCommit = jest.fn();
const mockRunTransaction = jest.fn();
const mockDelete = jest.fn();

const mockBatch = jest.fn(() => ({
  set: mockSet,
  update: mockUpdate,
  commit: mockCommit,
}));

jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  firestore: Object.assign(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: mockGet,
        set: mockSet,
        update: mockUpdate,
        delete: mockDelete,
      })),
    })),
    doc: jest.fn(() => ({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
      delete: mockDelete,
    })),
    batch: mockBatch,
    runTransaction: mockRunTransaction,
  }), {
    Timestamp: {
      now: jest.fn(() => ({toMillis: () => Date.now()})),
    },
  }),
}));

jest.mock("firebase-functions/params", () => ({
  defineSecret: jest.fn(() => ({value: () => "mock-api-key"})),
}));

jest.mock("firebase-functions", () => ({
  setGlobalOptions: jest.fn(),
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
  },
  https: {
    onCall: jest.fn((handler) => handler),
  },
}));

jest.mock("firebase-functions/v2/https", () => ({
  onRequest: jest.fn((options, handler) => {
    if (typeof options === "function") return options;
    return handler;
  }),
  onCall: jest.fn((options, handler) => {
    if (typeof options === "function") return options;
    return handler;
  }),
  HttpsError: class HttpsError extends Error {
    /**
     * Mock class for HttpsError.
     * @param {string} code - error code.
     * @param {string} message - error message.
     */
    constructor(public code: string, message: string) {
      super(message);
    }
  },
}));

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("../riotApiTransformer", () => ({
  transformRiotDataToMatchResult: jest.fn(() => Promise.resolve({
    winner: 100,
    blueTeam: {players: [{playerName: "Player1"}]},
    redTeam: {players: [{playerName: "Player2"}]},
  })),
}));

import {
  gameNotificationEndpoint,
  processGameFromNotification,
  generateTournamentCodesForMatch,
  generateAdhocTournamentCodes
} from "../index";
import {BracketRound, updateBracketForGameResult} from "../bracketUtils";

const createMockReqRes = (body: unknown) => {
  const req = {
    method: "POST",
    body,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  return {req, res};
};

describe("gameNotificationEndpoint Cloud Function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should process a new notification successfully", async () => {
    const notificationPayload = {
      startTime: 12345678,
      shortCode: "test-shortcode",
      gameId: 987654321,
      region: "NA",
    };

    // 1. Check if match_lock/test-shortcode exists
    // -> returns false (does not exist)
    mockGet.mockResolvedValueOnce({exists: false});

    // 2. Check if match_results/test-shortcode exists
    // (duplicate check in endpoint)
    // -> returns false (does not exist)
    mockGet.mockResolvedValueOnce({exists: false});

    // Mock axios get response for Riot API
    mockedAxios.get.mockResolvedValueOnce({data: {}});

    // Mock match doc exists (retrieved at line 714: db.doc(`matches/...`))
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({division: "gold", matchId: 101}),
    });

    // Mock division teams doc snap for findTeamIdByPlayerNames
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        teams: [
          {id: 1, name: "Team 1", players: [10]},
          {id: 2, name: "Team 2", players: [20]},
        ],
      }),
    });
    // Mock players doc snap for findTeamIdByPlayerNames
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        players: [
          {id: 10, name: "Player1"},
          {id: 20, name: "Player2"},
        ],
      }),
    });

    // 5. Check if match_results/test-shortcode exists
    // (duplicate check in executeGameNotificationProcessing)
    // -> returns false (does not exist)
    mockGet.mockResolvedValueOnce({exists: false});

    // Mock updateStandings transaction execution
    mockRunTransaction.mockImplementationOnce(async (updateFn) => {
      const mockTx = {
        getAll: jest.fn().mockResolvedValueOnce([
          {
            exists: true,
            data: () => ({
              matches: [{id: 101, team1Id: 1, team2Id: 2, status: "active"}],
            }),
          },
          {
            exists: true,
            data: () => ({
              teams: [
                {
                  id: 1,
                  gameWins: 0,
                  gameLosses: 0,
                  wins: 0,
                  losses: 0,
                  record: "0-0",
                  gameRecord: "0-0",
                },
                {
                  id: 2,
                  gameWins: 0,
                  gameLosses: 0,
                  wins: 0,
                  losses: 0,
                  record: "0-0",
                  gameRecord: "0-0",
                },
              ],
            }),
          },
          {
            exists: false,
          },
        ]),
        update: jest.fn(),
      };
      await updateFn(mockTx);
    });

    const {req, res} = createMockReqRes(notificationPayload);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await gameNotificationEndpoint(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      message: "Match result created successfully.",
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockCommit).toHaveBeenCalledTimes(1);

    const matchResultSetCall = mockSet.mock.calls.find(
      (call: any[]) =>
        call[1] &&
        call[1].gameId === notificationPayload.gameId
    );
    expect(matchResultSetCall).toBeDefined();
    expect("title" in matchResultSetCall![1]).toBe(false);
  });

  it("should return 200 OK if shortcode already exists", async () => {
    const notificationPayload = {
      startTime: 12345678,
      shortCode: "duplicate-shortcode",
      gameId: 987654321,
      region: "NA",
    };

    // 1. Check if match_lock/duplicate-shortcode exists (lock check)
    // -> returns false (does not exist)
    mockGet.mockResolvedValueOnce({exists: false});

    // 2. Check if match_results/duplicate-shortcode exists
    // -> returns true (exists)
    mockGet.mockResolvedValueOnce({exists: true});

    const {req, res} = createMockReqRes(notificationPayload);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await gameNotificationEndpoint(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      message: "Match result already processed.",
    });
    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it("should return 200 OK if match lock already exists", async () => {
    const notificationPayload = {
      startTime: 12345678,
      shortCode: "locked-shortcode",
      gameId: 987654321,
      region: "NA",
    };

    // 1. Check if match_lock/locked-shortcode exists (lock check)
    // -> returns true (exists, meaning already being processed)
    mockGet.mockResolvedValueOnce({exists: true});

    const {req, res} = createMockReqRes(notificationPayload);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await gameNotificationEndpoint(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      message: "Match is already being processed.",
    });
    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it(
    "should not increment team records if shortcode has already been processed",
    async () => {
      const notificationPayload = {
        startTime: 12345678,
        shortCode: "test-shortcode",
        gameId: 987654321,
        region: "NA",
      };

      // 1. Check if match_lock/test-shortcode exists
      mockGet.mockResolvedValueOnce({exists: false});

      // 2. Check if match_results/test-shortcode exists
      // (duplicate check in endpoint)
      // -> returns false (does not exist)
      mockGet.mockResolvedValueOnce({exists: false});

      // Mock axios get response for Riot API
      mockedAxios.get.mockResolvedValueOnce({data: {}});

      // Mock match doc exists
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({division: "gold", matchId: 101}),
      });

      // Mock division teams doc snap for findTeamIdByPlayerNames
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          teams: [
            {id: 1, name: "Team 1", players: [10]},
            {id: 2, name: "Team 2", players: [20]},
          ],
        }),
      });
      // Mock players doc snap for findTeamIdByPlayerNames
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          players: [
            {id: 10, name: "Player1"},
            {id: 20, name: "Player2"},
          ],
        }),
      });

      // Check if match_results/test-shortcode exists
      mockGet.mockResolvedValueOnce({exists: false});

      // Mock updateStandings transaction execution with
      // already processed shortCode in match results
      const mockUpdateTx = jest.fn();
      mockRunTransaction.mockImplementationOnce(async (updateFn) => {
        const mockTx = {
          getAll: jest.fn().mockResolvedValueOnce([
            {
              exists: true,
              data: () => ({
                matches: [{
                  id: 101,
                  team1Id: 1,
                  team2Id: 2,
                  status: "active",
                  results: {
                    "test-shortcode": {
                      winnerId: 1,
                      team1Win: 1,
                      team2Win: 0,
                    },
                  },
                }],
              }),
            },
            {
              exists: true,
              data: () => ({
                teams: [
                  {
                    id: 1,
                    gameWins: 1,
                    gameLosses: 0,
                    wins: 0,
                    losses: 0,
                    record: "0-0",
                    gameRecord: "1-0",
                  },
                  {
                    id: 2,
                    gameWins: 0,
                    gameLosses: 1,
                    wins: 0,
                    losses: 0,
                    record: "0-0",
                    gameRecord: "0-1",
                  },
                ],
              }),
            },
            {
              exists: false,
            },
          ]),
          update: mockUpdateTx,
        };
        await updateFn(mockTx);
      });

      const {req, res} = createMockReqRes(notificationPayload);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await gameNotificationEndpoint(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        message: "Match result created successfully.",
      });

      // Verify transaction updates were called, but teams doc was NOT
      // updated with new wins (gameWins should remain 1)
      expect(mockUpdateTx).toHaveBeenCalledTimes(2);
      const teamsCall = mockUpdateTx.mock.calls.find(
        (call) => call[1] && "teams" in call[1]
      );
      expect(teamsCall).toBeDefined();
      const updatedTeams = teamsCall[1].teams;
      expect(updatedTeams[0].gameWins).toBe(1);
    }
  );
});

describe("processGameFromNotification Cloud Function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPayload = {
    startTime: 12345678,
    shortCode: "test-shortcode",
    gameId: 987654321,
    region: "NA",
  };

  it("should fail if request is not authenticated as admin", async () => {
    await expect(
      (processGameFromNotification as any)({
        auth: undefined,
        data: validPayload,
      })
    ).rejects.toThrow("Must be an administrator to perform this action.");
  });

  it("should fail if request data is missing required fields", async () => {
    await expect(
      (processGameFromNotification as any)({
        auth: {token: {adminId: "admin-1"}},
        data: {
          gameId: 987654321,
          region: "NA",
        },
      })
    ).rejects.toThrow(
      "The notificationData must contain 'shortCode', 'gameId', and 'region'."
    );
  });

  it(
    "should process the game notification successfully when admin",
    async () => {
    // Mock axios get response for Riot API
      mockedAxios.get.mockResolvedValueOnce({data: {}});

      // Mock match doc exists
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({division: "gold", matchId: 101}),
      });

      // Mock division teams doc snap for findTeamIdByPlayerNames
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          teams: [
            {id: 1, name: "Team 1", players: [10]},
            {id: 2, name: "Team 2", players: [20]},
          ],
        }),
      });
      // Mock players doc snap for findTeamIdByPlayerNames
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          players: [
            {id: 10, name: "Player1"},
            {id: 20, name: "Player2"},
          ],
        }),
      });

      // Mock duplicate check in executeGameNotificationProcessing
      mockGet.mockResolvedValueOnce({exists: false});

      // Mock updateStandings transaction execution
      mockRunTransaction.mockImplementationOnce(async (updateFn) => {
        const mockTx = {
          getAll: jest.fn().mockResolvedValueOnce([
            {
              exists: true,
              data: () => ({
                matches: [{id: 101, team1Id: 1, team2Id: 2, status: "active"}],
              }),
            },
            {
              exists: true,
              data: () => ({
                teams: [
                  {
                    id: 1,
                    gameWins: 0,
                    gameLosses: 0,
                    wins: 0,
                    losses: 0,
                    record: "0-0",
                    gameRecord: "0-0",
                  },
                  {
                    id: 2,
                    gameWins: 0,
                    gameLosses: 0,
                    wins: 0,
                    losses: 0,
                    record: "0-0",
                    gameRecord: "0-0",
                  },
                ],
              }),
            },
            {
              exists: false,
            },
          ]),
          update: jest.fn(),
        };
        await updateFn(mockTx);
      });

      const response = await (processGameFromNotification as any)({
        auth: {token: {adminId: "admin-1"}},
        data: validPayload,
      });

      expect(response).toEqual({
        success: true,
        message: "Game processed successfully.",
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockCommit).toHaveBeenCalledTimes(1);
    });

  it("should update bracket seed to in_progress " +
    "when game 1 is won in best-of-3", async () => {
    const notificationPayload = {
      startTime: 12345678,
      shortCode: "ko-shortcode-1",
      gameId: 987654321,
      region: "NA",
    };

    // 1. match_lock check
    mockGet.mockResolvedValueOnce({exists: false});
    // 2. match_results check
    mockGet.mockResolvedValueOnce({exists: false});
    // 3. Riot API
    mockedAxios.get.mockResolvedValueOnce({data: {}});
    // 4. match doc exists with isKnockout and matchId
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({division: "gold", matchId: "ko_1", isKnockout: true}),
    });
    // 5. division teams doc
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        teams: [
          {id: 1, name: "Team 1", players: [10]},
          {id: 4, name: "Team 4", players: [20]},
        ],
      }),
    });
    // 6. division players doc
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        players: [
          {id: 10, name: "Player1"},
          {id: 20, name: "Player2"},
        ],
      }),
    });
    // 7. match_results duplicate check
    mockGet.mockResolvedValueOnce({exists: false});

    const initialBracket = [
      {
        title: "Winners Semifinals",
        seeds: [
          {
            id: 1,
            team1Id: 1,
            team2Id: 4,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 1,
            tournamentCodes: ["ko-shortcode-1"],
            teams: [{id: 1, name: "Team 1"}, {id: 4, name: "Team 4"}],
          },
          {
            id: 2,
            team1Id: 2,
            team2Id: 3,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 1,
            tournamentCodes: [],
            teams: [{id: 2, name: "Team 2"}, {id: 3, name: "Team 3"}],
          },
        ],
      },
      {
        title: "Winners Finals",
        seeds: [
          {
            id: 3,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 2,
            tournamentCodes: [],
            teams: [],
          },
        ],
      },
      {
        title: "Losers Round 1",
        seeds: [
          {
            id: 4,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 2,
            tournamentCodes: [],
            teams: [],
          },
          {
            id: 5,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 2,
            tournamentCodes: [],
            teams: [],
          },
        ],
      },
      {
        title: "Losers Semifinals",
        seeds: [
          {
            id: 6,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 3,
            tournamentCodes: [],
            teams: [],
          },
        ],
      },
      {
        title: "Losers Finals",
        seeds: [
          {
            id: 7,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 4,
            tournamentCodes: [],
            teams: [],
          },
        ],
      },
      {
        title: "Grand Finals",
        seeds: [
          {
            id: 8,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 5,
            tournamentCodes: [],
            teams: [],
          },
          {
            id: 9,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 5,
            tournamentCodes: [],
            teams: [],
          },
        ],
      },
    ];

    const mockTxUpdate = jest.fn();
    mockRunTransaction.mockImplementationOnce(async (updateFn) => {
      const mockTx = {
        getAll: jest.fn().mockResolvedValueOnce([
          {
            exists: true,
            data: () => ({
              matches: [
                {
                  id: "ko_1",
                  team1Id: 1,
                  team2Id: 4,
                  status: "upcoming",
                  isKnockout: true,
                  tournamentCodes: ["ko-shortcode-1"],
                },
              ],
            }),
          },
          {
            exists: true,
            data: () => ({
              teams: [
                {
                  id: 1,
                  name: "Team 1",
                  gameWins: 0,
                  gameLosses: 0,
                  wins: 0,
                  losses: 0,
                  record: "0-0",
                  gameRecord: "0-0",
                },
                {
                  id: 4,
                  name: "Team 4",
                  gameWins: 0,
                  gameLosses: 0,
                  wins: 0,
                  losses: 0,
                  record: "0-0",
                  gameRecord: "0-0",
                },
              ],
            }),
          },
          {
            exists: true,
            data: () => ({
              bracket: initialBracket,
            }),
          },
        ]),
        update: mockTxUpdate,
      };
      await updateFn(mockTx);
    });

    const {req, res} = createMockReqRes(notificationPayload);
    await gameNotificationEndpoint(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockTxUpdate).toHaveBeenCalledTimes(3);

    // Verify bracket update call
    const bracketUpdateCall = mockTxUpdate.mock.calls.find(
      (call: any[]) => call[1] && call[1].bracket !== undefined
    );
    expect(bracketUpdateCall).toBeDefined();
    const updatedBracket = bracketUpdateCall[1].bracket;
    const seed1 = updatedBracket[0].seeds[0];
    expect(seed1.status).toBe("in_progress");
    expect(seed1.score).toBe("1-0");
    expect(seed1.winnerId).toBeNull();
  });

  it("should update bracket seed to completed and advance " +
    "winners/losers when best-of-3 finishes", async () => {
    const notificationPayload = {
      startTime: 12345678,
      shortCode: "ko-shortcode-2",
      gameId: 987654322,
      region: "NA",
    };

    // 1. match_lock check
    mockGet.mockResolvedValueOnce({exists: false});
    // 2. match_results check
    mockGet.mockResolvedValueOnce({exists: false});
    // 3. Riot API
    mockedAxios.get.mockResolvedValueOnce({data: {}});
    // 4. match doc exists with isKnockout and matchId
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({division: "gold", matchId: "ko_1", isKnockout: true}),
    });
    // 5. division teams doc
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        teams: [
          {id: 1, name: "Team 1", players: [10]},
          {id: 4, name: "Team 4", players: [20]},
        ],
      }),
    });
    // 6. division players doc
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        players: [
          {id: 10, name: "Player1"},
          {id: 20, name: "Player2"},
        ],
      }),
    });
    // 7. match_results duplicate check
    mockGet.mockResolvedValueOnce({exists: false});

    const initialBracket = [
      {
        title: "Winners Semifinals",
        seeds: [
          {
            id: 1,
            team1Id: 1,
            team2Id: 4,
            status: "in_progress",
            score: "1-0",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 1,
            tournamentCodes: ["ko-shortcode-1", "ko-shortcode-2"],
            teams: [{id: 1, name: "Team 1"}, {id: 4, name: "Team 4"}],
          },
          {
            id: 2,
            team1Id: 2,
            team2Id: 3,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 1,
            tournamentCodes: [],
            teams: [{id: 2, name: "Team 2"}, {id: 3, name: "Team 3"}],
          },
        ],
      },
      {
        title: "Winners Finals",
        seeds: [
          {
            id: 3,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 2,
            tournamentCodes: [],
            teams: [],
          },
        ],
      },
      {
        title: "Losers Round 1",
        seeds: [
          {
            id: 4,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 2,
            tournamentCodes: [],
            teams: [],
          },
          {
            id: 5,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 2,
            tournamentCodes: [],
            teams: [],
          },
        ],
      },
      {
        title: "Losers Semifinals",
        seeds: [
          {
            id: 6,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 3,
            tournamentCodes: [],
            teams: [],
          },
        ],
      },
      {
        title: "Losers Finals",
        seeds: [
          {
            id: 7,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 4,
            tournamentCodes: [],
            teams: [],
          },
        ],
      },
      {
        title: "Grand Finals",
        seeds: [
          {
            id: 8,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 5,
            tournamentCodes: [],
            teams: [],
          },
          {
            id: 9,
            team1Id: 0,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 5,
            tournamentCodes: [],
            teams: [],
          },
        ],
      },
    ];

    const mockTxUpdate = jest.fn();
    mockRunTransaction.mockImplementationOnce(async (updateFn) => {
      const mockTx = {
        getAll: jest.fn().mockResolvedValueOnce([
          {
            exists: true,
            data: () => ({
              matches: [
                {
                  id: "ko_1",
                  team1Id: 1,
                  team2Id: 4,
                  status: "in_progress",
                  isKnockout: true,
                  tournamentCodes: ["ko-shortcode-1", "ko-shortcode-2"],
                  results: {
                    "ko-shortcode-1": {
                      winnerId: 1,
                      team1Win: 1,
                      team2Win: 0,
                    },
                  },
                  team1Wins: 1,
                  team2Wins: 0,
                },
              ],
            }),
          },
          {
            exists: true,
            data: () => ({
              teams: [
                {
                  id: 1,
                  name: "Team 1",
                  gameWins: 1,
                  gameLosses: 0,
                  wins: 0,
                  losses: 0,
                  record: "0-0",
                  gameRecord: "1-0",
                },
                {
                  id: 4,
                  name: "Team 4",
                  gameWins: 0,
                  gameLosses: 1,
                  wins: 0,
                  losses: 0,
                  record: "0-0",
                  gameRecord: "0-1",
                },
              ],
            }),
          },
          {
            exists: true,
            data: () => ({
              bracket: initialBracket,
            }),
          },
        ]),
        update: mockTxUpdate,
      };
      await updateFn(mockTx);
    });

    const {req, res} = createMockReqRes(notificationPayload);
    await gameNotificationEndpoint(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(201);

    const bracketUpdateCall = mockTxUpdate.mock.calls.find(
      (call: any[]) => call[1] && call[1].bracket !== undefined
    );
    expect(bracketUpdateCall).toBeDefined();
    const updatedBracket = bracketUpdateCall[1].bracket;
    const seed1 = updatedBracket[0].seeds[0];
    expect(seed1.status).toBe("completed");
    expect(seed1.score).toBe("2-0");
    expect(seed1.winnerId).toBe(1);

    // Verify progression: Winners Finals (seed 3) gets winner
    // of seed 1 (Team 1)
    const seed3 = updatedBracket[1].seeds[0];
    expect(seed3.team1Id).toBe(1);

    // Verify progression: Losers Round 1 (seed 4) gets loser
    // of seed 1 (Team 4)
    const seed4 = updatedBracket[2].seeds[0];
    expect(seed4.team2Id).toBe(4);

    // Verify teams doc was NOT updated with knockout results (Swiss records remain untouched)
    const teamsCall = mockTxUpdate.mock.calls.find(
      (call: any[]) => call[1] && call[1].teams !== undefined
    );
    expect(teamsCall).toBeDefined();
    const updatedTeams = teamsCall[1].teams;
    expect(updatedTeams[0].wins).toBe(0);
    expect(updatedTeams[0].record).toBe("0-0");
    expect(updatedTeams[0].gameWins).toBe(1);
    expect(updatedTeams[1].losses).toBe(0);
    expect(updatedTeams[1].record).toBe("0-0");
  });

  it("should handle knockout match when a Swiss match with the same numeric ID exists without confusing them and without error when team2Id is 0", async () => {
    const notificationPayload = {
      startTime: 12345678,
      shortCode: "ko-shortcode-zero-team",
      gameId: 987654399,
      region: "NA",
    };

    // 1. match_lock check
    mockGet.mockResolvedValueOnce({exists: false});
    // 2. match_results check
    mockGet.mockResolvedValueOnce({exists: false});
    // 3. Riot API
    mockedAxios.get.mockResolvedValueOnce({data: {}});
    // 4. match doc exists with isKnockout and matchId
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({division: "master", matchId: "ko_1", isKnockout: true}),
    });
    // 5. division teams doc - only Team 12 exists, team 0 does not!
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        teams: [
          {
            id: 12,
            name: "Team 12",
            players: [10],
            gameWins: 0,
            gameLosses: 0,
            wins: 0,
            losses: 0,
          },
        ],
      }),
    });
    // 6. division players doc
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        players: [
          {id: 10, name: "Player1"},
        ],
      }),
    });
    // 7. match_results duplicate check
    mockGet.mockResolvedValueOnce({exists: false});

    const initialBracket = [
      {
        title: "Winners Semifinals",
        seeds: [
          {
            id: 1,
            team1Id: 12,
            team2Id: 0,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 1,
            tournamentCodes: ["ko-shortcode-zero-team"],
            teams: [{id: 12, name: "Team 12"}, {id: 0, name: "TBD"}],
          },
        ],
      },
    ];

    const mockTxUpdate = jest.fn();
    mockRunTransaction.mockImplementationOnce(async (updateFn) => {
      const mockTx = {
        getAll: jest.fn().mockResolvedValueOnce([
          {
            exists: true,
            data: () => ({
              matches: [
                // Swiss match 1 has numeric ID 1 and team2Id: 0 (BYE)
                {
                  id: 1,
                  team1Id: 12,
                  team2Id: 0,
                  status: "completed",
                  score: "BYE",
                  isKnockout: false,
                  tournamentCodes: ["swiss-code-1"],
                },
                // Knockout match 1 has string ID "ko_1" and team2Id: 0
                {
                  id: "ko_1",
                  team1Id: 12,
                  team2Id: 0,
                  status: "upcoming",
                  score: "",
                  isKnockout: true,
                  tournamentCodes: ["ko-shortcode-zero-team"],
                },
              ],
            }),
          },
          {
            exists: true,
            data: () => ({
              teams: [
                {
                  id: 12,
                  name: "Team 12",
                  gameWins: 0,
                  gameLosses: 0,
                  wins: 0,
                  losses: 0,
                  record: "0-0",
                  gameRecord: "0-0",
                },
              ],
            }),
          },
          {
            exists: true,
            data: () => ({
              bracket: initialBracket,
            }),
          },
        ]),
        update: mockTxUpdate,
      };
      await updateFn(mockTx);
    });

    const {req, res} = createMockReqRes(notificationPayload);
    await gameNotificationEndpoint(req as any, res as any);

    // It should succeed with 201 without throwing error for missing team 0
    expect(res.status).toHaveBeenCalledWith(201);

    // Verify Swiss match 1 was NOT modified to be knockout or updated with knockout score
    const matchesUpdateCall = mockTxUpdate.mock.calls.find(
      (call: any[]) => call[1] && call[1].matches !== undefined
    );
    expect(matchesUpdateCall).toBeDefined();
    const updatedMatches = matchesUpdateCall[1].matches;
    const swissMatch = updatedMatches.find((m: any) => m.id === 1);
    expect(swissMatch.isKnockout).toBe(false);
    expect(swissMatch.score).toBe("BYE");

    const koMatch = updatedMatches.find((m: any) => m.id === "ko_1");
    expect(koMatch.isKnockout).toBe(true);
    expect(koMatch.score).toBe("1-0");
  });

  it("should generate tournament codes and sync to both matches and bracket documents", async () => {
    // 1. metadata doc get
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        grumble2026_tournamentId: "riot-tourney-123",
      }),
    });

    // 2. Riot API post
    mockedAxios.post.mockResolvedValueOnce({
      data: ["NEW-CODE-1", "NEW-CODE-2", "NEW-CODE-3"],
    });

    const initialBracket = [
      {
        title: "Winners Semifinals",
        seeds: [
          {
            id: 1,
            team1Id: 12,
            team2Id: 5,
            status: "upcoming",
            tournamentCodes: [],
          },
        ],
      },
    ];

    const mockTxUpdate = jest.fn();
    mockRunTransaction.mockImplementationOnce(async (updateFn) => {
      const mockTx = {
        getAll: jest.fn().mockResolvedValueOnce([
          {
            exists: true,
            data: () => ({
              // Only Swiss matches initially in matches doc!
              matches: [
                {id: 1, team1Id: 1, team2Id: 2, isKnockout: false, tournamentCodes: []},
              ],
            }),
          },
          {
            exists: true,
            data: () => ({
              bracket: initialBracket,
            }),
          },
        ]),
        update: mockTxUpdate,
      };
      await updateFn(mockTx);
    });

    const req = {
      auth: {token: {adminId: "admin-user"}},
      data: {
        division: "master",
        matchId: "ko_1",
        count: 3,
        isKnockout: true,
        year: "2026",
      },
    };

    const result = await (generateTournamentCodesForMatch as any)(req);
    expect(result).toEqual({codes: ["NEW-CODE-1", "NEW-CODE-2", "NEW-CODE-3"]});

    // Verify bracket was updated with codes
    const bracketCall = mockTxUpdate.mock.calls.find(
      (call: any[]) => call[1] && call[1].bracket !== undefined
    );
    expect(bracketCall).toBeDefined();
    expect(bracketCall[1].bracket[0].seeds[0].tournamentCodes).toEqual([
      "NEW-CODE-1",
      "NEW-CODE-2",
      "NEW-CODE-3",
    ]);

    // Verify matches was updated with new knockout match containing codes
    const matchesCall = mockTxUpdate.mock.calls.find(
      (call: any[]) => call[1] && call[1].matches !== undefined
    );
    expect(matchesCall).toBeDefined();
    const koMatch = matchesCall[1].matches.find((m: any) => m.id === "ko_1");
    expect(koMatch).toBeDefined();
    expect(koMatch.tournamentCodes).toEqual([
      "NEW-CODE-1",
      "NEW-CODE-2",
      "NEW-CODE-3",
    ]);
  });

  it("should process adhoc showmatch notification and store match result without updating standings", async () => {
    const notificationPayload = {
      startTime: 12345678,
      shortCode: "NA04f69-ADHOC-TEST",
      gameId: 999999,
      region: "NA",
    };

    // 1. Check match_lock/NA04f69-ADHOC-TEST -> does not exist
    mockGet.mockResolvedValueOnce({exists: false});
    // 2. Check match_results/NA04f69-ADHOC-TEST (endpoint duplicate check) -> does not exist
    mockGet.mockResolvedValueOnce({exists: false});
    // 3. Axios Riot API match details
    mockedAxios.get.mockResolvedValueOnce({data: {}});
    // 4. Mock match doc for shortCode with isAdhoc: true
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        division: "elemental",
        matchId: "catharsis_g1",
        title: "GRumble Catharsis Showmatch - Game 1",
        isAdhoc: true,
        isStandalone: true,
        skipStandings: true,
      }),
    });
    // 5. Teams doc
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        teams: [
          {id: 1, name: "Working From Homeguard V2", players: [10]},
        ],
      }),
    });
    // 6. Players doc
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        players: [{id: 10, name: "Player1"}],
      }),
    });
    // 7. Check match_results/NA04f69-ADHOC-TEST in executeGameNotificationProcessing -> does not exist
    mockGet.mockResolvedValueOnce({exists: false});

    const {req, res} = createMockReqRes(notificationPayload);
    await (gameNotificationEndpoint as any)(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    // Verify match result was stored with isAdhoc: true
    const resultCall = mockSet.mock.calls.find(
      (call: any[]) =>
        (call[1] && call[1].isAdhoc === true) ||
        (call[0] && call[0].isAdhoc === true)
    );
    expect(resultCall).toBeDefined();
    const resultData = resultCall![1] || resultCall![0];
    expect(resultData.skipStandings).toBe(true);
    expect(resultData.title).toBe("GRumble Catharsis Showmatch - Game 1");

    // Verify match status was updated to completed
    const matchUpdateCall = mockUpdate.mock.calls.find(
      (call: any[]) =>
        (call[1] && call[1].status === "completed") ||
        (call[0] && call[0].status === "completed")
    );
    expect(matchUpdateCall).toBeDefined();

    // Verify transaction (which updates standings) was NOT called!
    expect(mockRunTransaction).not.toHaveBeenCalled();
  });

  it("should generate adhoc tournament codes and store in matches and adhocTournamentCodes", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: ["NA04f69-CATHARSIS-1", "NA04f69-CATHARSIS-2"],
    });
    // tournamentMetadata doc
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({grumble2026_tournamentId: "12345"}),
    });

    const mockRequest = {
      auth: {token: {adminId: "superadmin"}},
      data: {
        title: "GRumble Catharsis",
        division: "elemental",
        matchId: "catharsis_bo5",
        count: 2,
      },
    };

    const result = await (generateAdhocTournamentCodes as any)(mockRequest);
    expect(result.success).toBe(true);
    expect(result.codes).toEqual(["NA04f69-CATHARSIS-1", "NA04f69-CATHARSIS-2"]);

    // Verify batch set was called for both matches and adhocTournamentCodes
    const setCalls = mockSet.mock.calls.filter(
      (call: any[]) =>
        (call[1] && call[1].isAdhoc === true) ||
        (call[0] && call[0].isAdhoc === true)
    );
    expect(setCalls.length).toBe(4); // 2 codes * (matches + adhocTournamentCodes)
    const record = setCalls[0][1] || setCalls[0][0];
    expect(record.skipStandings).toBe(true);
  });

  it("should not pick a completed match when two matches have the same teams in updateBracketForGameResult", () => {
    const bracket: BracketRound[] = [
      {
        title: "Winners Semifinals",
        seeds: [
          {
            id: 1,
            team1Id: 1,
            team2Id: 4,
            status: "completed",
            score: "2-0",
            winnerId: 1,
            isKnockout: true,
            weekPlayed: 1,
            tournamentCodes: ["ko-old-code-1", "ko-old-code-2"],
            teams: [{id: 1, name: "Team 1"}, {id: 4, name: "Team 4"}],
          },
          {
            id: 2,
            team1Id: 2,
            team2Id: 3,
            status: "completed",
            score: "2-0",
            winnerId: 2,
            isKnockout: true,
            weekPlayed: 1,
            tournamentCodes: [],
            teams: [{id: 2, name: "Team 2"}, {id: 3, name: "Team 3"}],
          },
        ],
      },
      {
        title: "Grand Finals",
        seeds: [
          {
            id: 8,
            team1Id: 1,
            team2Id: 4,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 5,
            tournamentCodes: ["ko-gf-code-1"],
            teams: [{id: 1, name: "Team 1"}, {id: 4, name: "Team 4"}],
          },
        ],
      },
    ];

    const currentMatch: any = {
      id: "ko_8",
      team1Id: 1,
      team2Id: 4,
      isKnockout: true,
      results: {
        "ko-gf-code-1": {
          winnerId: 1,
          team1Win: 1,
          team2Win: 0,
        },
      },
      status: "in_progress",
    };

    // Even if matchId points to 1 (the completed seed), it should pick Seed 8 instead of Seed 1
    const updated = updateBracketForGameResult(
      bracket,
      "ko-gf-code-1",
      1,
      1,
      [{id: 1, name: "Team 1"}, {id: 4, name: "Team 4"}] as any,
      [],
      currentMatch
    );

    const seed1 = updated[0].seeds.find((s) => s.id === 1)!;
    const seed8 = updated[1].seeds.find((s) => s.id === 8)!;

    // Seed 1 must remain completed with 2-0 score and unchanged winnerId
    expect(seed1.status).toBe("completed");
    expect(seed1.score).toBe("2-0");
    expect(seed1.winnerId).toBe(1);

    // Seed 8 must be updated to in_progress with 1-0 score
    expect(seed8.status).toBe("in_progress");
    expect(seed8.score).toBe("1-0");
    expect(seed8.tournamentCodes).toContain("ko-gf-code-1");
  });

  it("should update upcoming match instead of completed match when two matches have the same teams in updateStandings", async () => {
    const notificationPayload = {
      startTime: 12345678,
      shortCode: "ko-gf-code-1",
      gameId: 987654323,
      region: "NA",
    };

    // 1. match_lock check
    mockGet.mockResolvedValueOnce({exists: false});
    // 2. match_results check
    mockGet.mockResolvedValueOnce({exists: false});
    // 3. Riot API
    mockedAxios.get.mockResolvedValueOnce({data: {}});
    // 4. match doc exists with matchId: "ko_1" (accidentally or historically pointing to match 1)
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({division: "gold", matchId: "ko_1", isKnockout: true}),
    });
    // 5. division teams doc
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        teams: [
          {id: 1, name: "Team 1", players: [10]},
          {id: 4, name: "Team 4", players: [20]},
        ],
      }),
    });
    // 6. division players doc
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        players: [
          {id: 10, name: "Player1"},
          {id: 20, name: "Player2"},
        ],
      }),
    });
    // 7. match_results duplicate check
    mockGet.mockResolvedValueOnce({exists: false});

    const initialBracket = [
      {
        title: "Winners Semifinals",
        seeds: [
          {
            id: 1,
            team1Id: 1,
            team2Id: 4,
            status: "completed",
            score: "2-0",
            winnerId: 1,
            isKnockout: true,
            weekPlayed: 1,
            tournamentCodes: ["ko-old-code-1", "ko-old-code-2"],
            teams: [{id: 1, name: "Team 1"}, {id: 4, name: "Team 4"}],
          },
        ],
      },
      {
        title: "Grand Finals",
        seeds: [
          {
            id: 8,
            team1Id: 1,
            team2Id: 4,
            status: "upcoming",
            score: "",
            winnerId: null,
            isKnockout: true,
            weekPlayed: 5,
            tournamentCodes: [],
            teams: [{id: 1, name: "Team 1"}, {id: 4, name: "Team 4"}],
          },
        ],
      },
    ];

    const mockTxUpdate = jest.fn();
    mockRunTransaction.mockImplementationOnce(async (updateFn) => {
      const mockTx = {
        getAll: jest.fn().mockResolvedValueOnce([
          {
            exists: true,
            data: () => ({
              matches: [
                {
                  id: "ko_1",
                  team1Id: 1,
                  team2Id: 4,
                  status: "completed",
                  score: "2-0",
                  winnerId: 1,
                  isKnockout: true,
                  tournamentCodes: ["ko-old-code-1", "ko-old-code-2"],
                  results: {
                    "ko-old-code-1": {winnerId: 1, team1Win: 1, team2Win: 0},
                    "ko-old-code-2": {winnerId: 1, team1Win: 1, team2Win: 0},
                  },
                },
                {
                  id: "ko_8",
                  team1Id: 1,
                  team2Id: 4,
                  status: "upcoming",
                  score: "",
                  winnerId: null,
                  isKnockout: true,
                  tournamentCodes: [],
                  results: {},
                },
              ],
            }),
          },
          {
            exists: true,
            data: () => ({
              teams: [
                {id: 1, name: "Team 1", gameWins: 2, gameLosses: 0, wins: 1, losses: 0, record: "1-0", gameRecord: "2-0"},
                {id: 4, name: "Team 4", gameWins: 0, gameLosses: 2, wins: 0, losses: 1, record: "0-1", gameRecord: "0-2"},
              ],
            }),
          },
          {
            exists: true,
            data: () => ({
              bracket: initialBracket,
            }),
          },
        ]),
        update: mockTxUpdate,
      };
      return await updateFn(mockTx);
    });

    const {req, res} = createMockReqRes(notificationPayload);
    await gameNotificationEndpoint(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(201);

    // Verify bracket update call
    const bracketUpdateCall = mockTxUpdate.mock.calls.find(
      (call: any[]) => call[1] && call[1].bracket !== undefined
    );
    expect(bracketUpdateCall).toBeDefined();
    const updatedBracket = bracketUpdateCall[1].bracket;

    const seed1 = updatedBracket[0].seeds.find((s: any) => s.id === 1);
    const seed8 = updatedBracket[1].seeds.find((s: any) => s.id === 8);

    // Seed 1 must remain untouched (completed, 2-0)
    expect(seed1.status).toBe("completed");
    expect(seed1.score).toBe("2-0");
    expect(seed1.winnerId).toBe(1);

    // Seed 8 must be updated to in_progress (1-0)
    expect(seed8.status).toBe("in_progress");
    expect(seed8.score).toBe("1-0");
    expect(seed8.tournamentCodes).toContain("ko-gf-code-1");

    // Verify matches update call
    const matchesUpdateCall = mockTxUpdate.mock.calls.find(
      (call: any[]) => call[1] && call[1].matches !== undefined
    );
    expect(matchesUpdateCall).toBeDefined();
    const updatedMatches = matchesUpdateCall[1].matches;

    const match1 = updatedMatches.find((m: any) => m.id === "ko_1");
    const match8 = updatedMatches.find((m: any) => m.id === "ko_8");

    // Match 1 must remain completed with 2-0
    expect(match1.status).toBe("completed");
    expect(match1.score).toBe("2-0");
    expect(match1.winnerId).toBe(1);

    // Match 8 must be updated to in_progress with 1-0
    expect(match8.status).toBe("in_progress");
    expect(match8.score).toBe("1-0");
    expect(match8.tournamentCodes).toContain("ko-gf-code-1");
  });
});

