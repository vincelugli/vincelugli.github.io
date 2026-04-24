import { Team, Match } from '../types';

export const mockSwissTeams: Team[] = [
  { id: 101, name: "Team Alpha", captainId: 1, players: [], wins: 3, losses: 0, gameWins: 6, gameLosses: 1, record: "3-0" },
  { id: 102, name: "Team Bravo", captainId: 2, players: [], wins: 3, losses: 1, gameWins: 6, gameLosses: 2, record: "3-1" },
  { id: 103, name: "Team Charlie", captainId: 3, players: [], wins: 3, losses: 2, gameWins: 8, gameLosses: 6, record: "3-2" },
  { id: 104, name: "Team Delta", captainId: 4, players: [], wins: 1, losses: 3, gameWins: 3, gameLosses: 6, record: "1-3" },
  { id: 105, name: "Team Echo", captainId: 5, players: [], wins: 3, losses: 1, gameWins: 6, gameLosses: 2, record: "3-1" },
  { id: 106, name: "Team Foxtrot", captainId: 6, players: [], wins: 2, losses: 3, gameWins: 5, gameLosses: 6, record: "2-3" },
  { id: 107, name: "Team Golf", captainId: 7, players: [], wins: 1, losses: 3, gameWins: 2, gameLosses: 6, record: "1-3" },
  { id: 108, name: "Team Hotel", captainId: 8, players: [], wins: 0, losses: 3, gameWins: 0, gameLosses: 6, record: "0-3" },
];

export const mockSwissMatches: Match[] = [
  // Round 1 (all 0-0)
  { id: "swiss_1", team1Id: 101, team2Id: 102, status: 'completed', tournamentCodes: [], weekPlayed: 1, winnerId: 101, score: "2-0", stage: "Round 1" },
  { id: "swiss_2", team1Id: 103, team2Id: 104, status: 'completed', tournamentCodes: [], weekPlayed: 1, winnerId: 103, score: "2-1", stage: "Round 1" },
  { id: "swiss_3", team1Id: 105, team2Id: 106, status: 'completed', tournamentCodes: [], weekPlayed: 1, winnerId: 105, score: "2-0", stage: "Round 1" },
  { id: "swiss_4", team1Id: 107, team2Id: 108, status: 'completed', tournamentCodes: [], weekPlayed: 1, winnerId: 107, score: "2-0", stage: "Round 1" },

  // Round 2
  // 1-0 Bracket
  { id: "swiss_5", team1Id: 101, team2Id: 103, status: 'completed', tournamentCodes: [], weekPlayed: 2, winnerId: 101, score: "2-1", stage: "Round 2" },
  { id: "swiss_6", team1Id: 105, team2Id: 107, status: 'completed', tournamentCodes: [], weekPlayed: 2, winnerId: 105, score: "2-0", stage: "Round 2" },
  // 0-1 Bracket
  { id: "swiss_7", team1Id: 102, team2Id: 104, status: 'completed', tournamentCodes: [], weekPlayed: 2, winnerId: 102, score: "2-0", stage: "Round 2" },
  { id: "swiss_8", team1Id: 106, team2Id: 108, status: 'completed', tournamentCodes: [], weekPlayed: 2, winnerId: 106, score: "2-0", stage: "Round 2" },

  // Round 3
  // 2-0 Bracket (Winner advances)
  { id: "swiss_9", team1Id: 101, team2Id: 105, status: 'completed', tournamentCodes: [], weekPlayed: 3, winnerId: 101, score: "2-0", stage: "Round 3" },
  // 1-1 Bracket
  { id: "swiss_10", team1Id: 103, team2Id: 107, status: 'completed', tournamentCodes: [], weekPlayed: 3, winnerId: 103, score: "2-0", stage: "Round 3" },
  { id: "swiss_11", team1Id: 102, team2Id: 106, status: 'completed', tournamentCodes: [], weekPlayed: 3, winnerId: 102, score: "2-1", stage: "Round 3" },
  // 0-2 Bracket (Loser eliminated)
  { id: "swiss_12", team1Id: 104, team2Id: 108, status: 'completed', tournamentCodes: [], weekPlayed: 3, winnerId: 104, score: "2-0", stage: "Round 3" },

  // Round 4
  // 2-1 Bracket (Winner advances)
  { id: "swiss_13", team1Id: 105, team2Id: 103, status: 'completed', tournamentCodes: [], weekPlayed: 4, winnerId: 105, score: "2-1", stage: "Round 4" },
  { id: "swiss_14", team1Id: 102, team2Id: 107, status: 'completed', tournamentCodes: [], weekPlayed: 4, winnerId: 102, score: "2-0", stage: "Round 4" },
  // 1-2 Bracket (Loser eliminated)
  { id: "swiss_15", team1Id: 106, team2Id: 104, status: 'completed', tournamentCodes: [], weekPlayed: 4, winnerId: 106, score: "2-1", stage: "Round 4" },

  // Round 5
  // 2-2 Bracket (Winner advances)
  { id: "swiss_16", team1Id: 103, team2Id: 106, status: 'completed', tournamentCodes: [], weekPlayed: 5, winnerId: 103, score: "2-1", stage: "Round 5" },
];
