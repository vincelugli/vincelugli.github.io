import axios from "axios";

const mockUpdate = jest.fn();
const mockGet = jest.fn();
const mockSet = jest.fn();
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

import {gameNotificationEndpoint, processGameFromNotification, generateTournamentCodesForMatch} from "../index";

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
});

