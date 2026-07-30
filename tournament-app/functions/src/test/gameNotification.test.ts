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

import {gameNotificationEndpoint, processGameFromNotification} from "../index";

describe("gameNotificationEndpoint Cloud Function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    // Mock division matches doc check
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        matches: [{
          id: 101,
          team1Id: 1,
          team2Id: 2,
          status: "active",
          team1Wins: 0,
          team2Wins: 0,
        }],
      }),
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

    // 6. Check if match_results/test-shortcode exists
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
    "should return 200 OK and skip processing if the match already " +
      "has a team with 2 wins",
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
      mockGet.mockResolvedValueOnce({exists: false});

      // 3. Mock match doc exists
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({division: "gold", matchId: 101}),
      });

      // 4. Mock division matches doc check, returning a match where team1
      // has 2 wins
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          matches: [{
            id: 101,
            team1Id: 1,
            team2Id: 2,
            status: "completed",
            team1Wins: 2,
            team2Wins: 0,
          }],
        }),
      });

      const {req, res} = createMockReqRes(notificationPayload);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await gameNotificationEndpoint(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        message: "Match result created successfully.",
      });
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(mockCommit).not.toHaveBeenCalled();
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

      // Mock division matches doc check
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          matches: [{
            id: 101,
            team1Id: 1,
            team2Id: 2,
            status: "active",
            team1Wins: 0,
            team2Wins: 0,
          }],
        }),
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
});

