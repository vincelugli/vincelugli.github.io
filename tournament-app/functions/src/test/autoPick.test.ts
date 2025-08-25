
// --- Mock the entire firebase-admin SDK ---
// This is the most important part. We create spies for the functions we"ll use.
const mockUpdate = jest.fn();
const mockGet = jest.fn();

jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: (collectionPath: string) => ({
      doc: (docPath: string) => ({
        get: mockGet,
        update: mockUpdate,
      }),
    }),
  }),
}));

jest.mock("firebase-admin/firestore", () => ({
  Timestamp: {
    now: jest.fn(() => new Date()),
  },
}));

jest.mock("firebase-functions/v2/tasks", () => ({
  // When `onRequest` is imported and called in our index.ts file...
  onTaskDispatched: jest.fn((options, handler) => {
    // ... we tell Jest to simply return the handler (our logic function).
    // This allows us to import and test the logic directly.
    return handler;
  }),
}));

import {executeAutoPick} from "../index";

// --- Test Data Setup ---
// Reusable player data for our tests
const allPlayers = [
  {
    id: 1,
    name: "Viper",
    peakRankTier: "Diamond",
    peakRankDivisoin: 1,
    soloRankTier: "Diamond",
    soloRankDivision: 1,
    flexRankTier: "Diamond",
    flexRankDivision: 1,
    role: "top",
    isCaptain: true,
    secondaryRoles: []},
  {
    id: 2,
    name: "Ghost",
    peakRankTier: "Emerald",
    peakRankDivisoin: 1,
    soloRankTier: "Emerald",
    soloRankDivision: 1,
    flexRankTier: "Emerald",
    flexRankDivision: 1,
    role: "jungle",
    isCaptain: true,
    secondaryRoles: []},
  {
    id: 5,
    name: "Raptor",
    peakRankTier: "Platinum",
    peakRankDivisoin: 1,
    soloRankTier: "Platinum",
    soloRankDivision: 1,
    flexRankTier: "Platinum",
    flexRankDivision: 1,
    role: "support",
    isCaptain: false,
    secondaryRoles: []},
  {
    id: 6,
    name: "Blaze",
    peakRankTier: "Gold",
    peakRankDivisoin: 1,
    soloRankTier: "Gold",
    soloRankDivision: 1,
    flexRankTier: "Gold",
    flexRankDivision: 1,
    role: "mid",
    isCaptain: false,
    secondaryRoles: []},
  {
    id: 8,
    name: "Omega",
    peakRankTier: "Silver",
    peakRankDivisoin: 1,
    soloRankTier: "Silver",
    soloRankDivision: 1,
    flexRankTier: "Silver",
    flexRankDivision: 1,
    role: "adc",
    isCaptain: false,
    secondaryRoles: []},
  {
    id: 9,
    name: "Kilo",
    peakRankTier: "Bronze",
    peakRankDivisoin: 1,
    soloRankTier: "Bronze",
    soloRankDivision: 1,
    flexRankTier: "Bronze",
    flexRankDivision: 1,
    role: "support",
    isCaptain: false,
    secondaryRoles: []},
];

// Base team roster for a team that needs a mid, adc, and support
const baseTeam = {
  id: 1,
  name: "Team Viper",
  players: [
    allPlayers.find((p) => p.id === 1), allPlayers.find((p) => p.id === 2),
  ],
};

// Base list of players available to be drafted
const baseAvailablePlayers = allPlayers.filter((p) => ![1, 2].includes(p.id));

describe("executeAutoPick Cloud Function", () => {
  // Before each test, clear the mock history to ensure a clean slate
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create mock request/response objects
  const createMockReqRes = (body: any, data: any = {}, headers: any = {}) => {
    const reqHeaders = {
      "content-type": "application/json",
      ...headers, // Allow passing custom headers like Authorization
    };

    const req = {
      method: "POST",
      headers: reqHeaders,
      body,
      data,
      header: jest.fn(
        (headerName: string) => reqHeaders[headerName.toLowerCase()]
      ),
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    return {req, res};
  };

  // --- TEST 1: Top of priority list fills a needed role ---
  it(`should auto-draft the highest
      priority player that fills a needed role`, async () => {
    // ARRANGE
    const priorityPlayerIds = [6, 5, 8];
    const twoHoursAhead = new Date(); // Get the current date and time
    twoHoursAhead.setHours(twoHoursAhead.getHours() + 2);
    const draftState = {
      teams: [baseTeam],
      availablePlayers: baseAvailablePlayers,
      pickOrder: [1],
      currentPickIndex: 0,
      pickEndsAt: twoHoursAhead,
    };

    // Configure mocks: draft doc exists, priority list exists
    mockGet.mockResolvedValueOnce({exists: true, data: () => draftState});
    mockGet.mockResolvedValueOnce({
      exists: true, data: () => ({playerIds: priorityPlayerIds}),
    });

    const {req, res} = createMockReqRes({}, {data: {draftId: "test-draft"}});

    // ACT
    await executeAutoPick(req as any, res as any);

    // ASSERT
    const updateCallPayload = mockUpdate.mock.calls[0][0];
    const draftedPlayer = updateCallPayload.teams[0].players[2];

    expect(draftedPlayer.id).toBe(6); // Should draft Blaze (mid)
    expect(updateCallPayload.availablePlayers.some(
      (p: any) => p.id === 6)).toBe(false);
  });

  it(`should skip priority players 
      whose roles are already filled`, async () => {
    // ARRANGE
    const priorityPlayerIds = [5, 6, 8];
    const teamWithSupport = {
      ...baseTeam,
      players: [...baseTeam.players, allPlayers.find((p) => p.id === 9)],
    };
    const twoHoursAhead = new Date(); // Get the current date and time
    twoHoursAhead.setHours(twoHoursAhead.getHours() + 2);
    const draftState = {
      teams: [teamWithSupport],
      availablePlayers: baseAvailablePlayers,
      pickOrder: [1],
      currentPickIndex: 0,
      pickEndsAt: twoHoursAhead,
    };

    mockGet.mockResolvedValueOnce({exists: true, data: () => draftState});
    mockGet.mockResolvedValueOnce({
      exists: true, data: () => ({playerIds: priorityPlayerIds}),
    });

    const {req, res} = createMockReqRes({}, {data: {draftId: "test-draft"}});

    // ACT
    await executeAutoPick(req as any, res as any);

    // ASSERT
    const updateCallPayload = mockUpdate.mock.calls[0][0];
    const draftedPlayer = updateCallPayload.teams[0].players[3];

    expect(draftedPlayer.id).toBe(6);
  });

  // --- TEST 3: No priority list is provided, should default to highest Elo ---
  it(`should auto-draft the highest Elo player 
      when no priority list exists`, async () => {
    // ARRANGE
    const twoHoursAhead = new Date(); // Get the current date and time
    twoHoursAhead.setHours(twoHoursAhead.getHours() + 2);
    const draftState = {
      teams: [baseTeam],
      availablePlayers: baseAvailablePlayers,
      pickOrder: [1],
      currentPickIndex: 0,
      pickEndsAt: twoHoursAhead,
    };

    // Configure mocks: draft doc exists, but priority list does NOT
    mockGet.mockResolvedValueOnce({exists: true, data: () => draftState});
    mockGet.mockResolvedValueOnce({exists: false}); // No priority list

    const {req, res} = createMockReqRes({}, {data: {draftId: "test-draft"}});

    // ACT
    await executeAutoPick(req as any, res as any);

    // ASSERT
    const updateCallPayload = mockUpdate.mock.calls[0][0];
    const draftedPlayer = updateCallPayload.teams[0].players[2];

    // Raptor (ID 5) has the highest Elo (2350) of the available players
    expect(draftedPlayer.id).toBe(5);
  });

  // --- TEST 4: Priority list exists but has no valid/available players ---
  it(`should auto-draft the highest Elo player 
      when the priority list has no available players`, async () => {
    // ARRANGE
    const priorityPlayerIds = [101, 102, 103];
    const twoHoursAhead = new Date(); // Get the current date and time
    twoHoursAhead.setHours(twoHoursAhead.getHours() + 2);
    const draftState = {
      teams: [baseTeam],
      availablePlayers: baseAvailablePlayers,
      pickOrder: [1],
      currentPickIndex: 0,
      pickEndsAt: twoHoursAhead,
    };

    mockGet.mockResolvedValueOnce({exists: true, data: () => draftState});
    mockGet.mockResolvedValueOnce({
      exists: true, data: () => ({playerIds: priorityPlayerIds}),
    });

    const {req, res} = createMockReqRes({}, {data: {draftId: "test-draft"}});

    // ACT
    await executeAutoPick(req as any, res as any);

    // ASSERT
    const updateCallPayload = mockUpdate.mock.calls[0][0];
    const draftedPlayer = updateCallPayload.teams[0].players[2];

    // Should fall back to highest Elo, which is Raptor (ID 5)
    expect(draftedPlayer.id).toBe(5);
  });
});
