import { Team, Match, BracketRound } from '../types';
import { getQualifyingSeeding, getTeamSeedMap, updateDoubleEliminationBracket } from './index';

describe('Seeding and Double Elimination Bracket Logic', () => {
  const mockTeams: Team[] = [
    { id: 1, name: 'Team Alpha', captainId: 101, players: [101], wins: 3, losses: 0, gameWins: 6, gameLosses: 0 },
    { id: 2, name: 'Team Beta', captainId: 102, players: [102], wins: 3, losses: 1, gameWins: 6, gameLosses: 2 },
    { id: 3, name: 'Team Gamma', captainId: 103, players: [103], wins: 3, losses: 1, gameWins: 6, gameLosses: 3 },
    { id: 4, name: 'Team Delta', captainId: 104, players: [104], wins: 3, losses: 2, gameWins: 6, gameLosses: 4 },
    { id: 5, name: 'Team Epsilon', captainId: 105, players: [105], wins: 3, losses: 2, gameWins: 6, gameLosses: 5 },
    { id: 6, name: 'Team Zeta', captainId: 106, players: [106], wins: 3, losses: 2, gameWins: 6, gameLosses: 6 },
    { id: 7, name: 'Team Eta', captainId: 107, players: [107], wins: 2, losses: 3, gameWins: 4, gameLosses: 6 },
  ];

  const mockMatches: Match[] = [
    // Team 1: 3 wins
    { id: 1, team1Id: 1, team2Id: 7, status: 'completed', winnerId: 1, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 1, tournamentCodes: [] },
    { id: 2, team1Id: 1, team2Id: 7, status: 'completed', winnerId: 1, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 2, tournamentCodes: [] },
    { id: 3, team1Id: 1, team2Id: 7, status: 'completed', winnerId: 1, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 3, tournamentCodes: [] },
    // Team 2: 3 wins
    { id: 4, team1Id: 2, team2Id: 7, status: 'completed', winnerId: 2, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 1, tournamentCodes: [] },
    { id: 5, team1Id: 2, team2Id: 7, status: 'completed', winnerId: 2, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 2, tournamentCodes: [] },
    { id: 6, team1Id: 2, team2Id: 7, status: 'completed', winnerId: 2, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 3, tournamentCodes: [] },
    // Team 3: 3 wins
    { id: 7, team1Id: 3, team2Id: 7, status: 'completed', winnerId: 3, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 1, tournamentCodes: [] },
    { id: 8, team1Id: 3, team2Id: 7, status: 'completed', winnerId: 3, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 2, tournamentCodes: [] },
    { id: 9, team1Id: 3, team2Id: 7, status: 'completed', winnerId: 3, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 3, tournamentCodes: [] },
    // Team 4: 3 wins
    { id: 10, team1Id: 4, team2Id: 7, status: 'completed', winnerId: 4, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 1, tournamentCodes: [] },
    { id: 11, team1Id: 4, team2Id: 7, status: 'completed', winnerId: 4, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 2, tournamentCodes: [] },
    { id: 12, team1Id: 4, team2Id: 7, status: 'completed', winnerId: 4, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 3, tournamentCodes: [] },
    // Team 5: 3 wins
    { id: 13, team1Id: 5, team2Id: 7, status: 'completed', winnerId: 5, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 1, tournamentCodes: [] },
    { id: 14, team1Id: 5, team2Id: 7, status: 'completed', winnerId: 5, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 2, tournamentCodes: [] },
    { id: 15, team1Id: 5, team2Id: 7, status: 'completed', winnerId: 5, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 3, tournamentCodes: [] },
    // Team 6: 3 wins
    { id: 16, team1Id: 6, team2Id: 7, status: 'completed', winnerId: 6, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 1, tournamentCodes: [] },
    { id: 17, team1Id: 6, team2Id: 7, status: 'completed', winnerId: 6, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 2, tournamentCodes: [] },
    { id: 18, team1Id: 6, team2Id: 7, status: 'completed', winnerId: 6, score: '2-0', team1Wins: 2, team2Wins: 0, weekPlayed: 3, tournamentCodes: [] },
  ];

  it('correctly calculates qualifying seeds 1 through 6', () => {
    const seeding = getQualifyingSeeding(mockTeams, mockMatches);
    expect(seeding.length).toBe(6);
    expect(seeding[0]?.id).toBe(1); // 3-0 record -> Seed 1
    expect(seeding[0]?.name).toBe('Team Alpha');
  });

  it('correctly maps teamId to seed number via getTeamSeedMap', () => {
    const seedMap = getTeamSeedMap(mockTeams, mockMatches);
    expect(seedMap.get(1)).toBe(1);
    expect(seedMap.get(mockTeams[1].id)).toBeDefined();
  });

  it('populates seed labels and assignments in updateDoubleEliminationBracket', () => {
    const emptyBracket: BracketRound[] = [
      {
        title: "Winners Semifinals",
        seeds: [
          { id: 1, team1Id: 0, team2Id: 0, status: "upcoming", score: "", winnerId: null, isKnockout: true, weekPlayed: 1, tournamentCodes: [], teams: [] },
          { id: 2, team1Id: 0, team2Id: 0, status: "upcoming", score: "", winnerId: null, isKnockout: true, weekPlayed: 1, tournamentCodes: [], teams: [] }
        ]
      },
      {
        title: "Winners Finals",
        seeds: [
          { id: 3, team1Id: 0, team2Id: 0, status: "upcoming", score: "", winnerId: null, isKnockout: true, weekPlayed: 2, tournamentCodes: [], teams: [] }
        ]
      },
      {
        title: "Losers Round 1",
        seeds: [
          { id: 4, team1Id: 0, team2Id: 0, status: "upcoming", score: "", winnerId: null, isKnockout: true, weekPlayed: 2, tournamentCodes: [], teams: [] },
          { id: 5, team1Id: 0, team2Id: 0, status: "upcoming", score: "", winnerId: null, isKnockout: true, weekPlayed: 2, tournamentCodes: [], teams: [] }
        ]
      },
      {
        title: "Losers Semifinals",
        seeds: [
          { id: 6, team1Id: 0, team2Id: 0, status: "upcoming", score: "", winnerId: null, isKnockout: true, weekPlayed: 3, tournamentCodes: [], teams: [] }
        ]
      },
      {
        title: "Losers Finals",
        seeds: [
          { id: 7, team1Id: 0, team2Id: 0, status: "upcoming", score: "", winnerId: null, isKnockout: true, weekPlayed: 3, tournamentCodes: [], teams: [] }
        ]
      },
      {
        title: "Grand Finals",
        seeds: [
          { id: 8, team1Id: 0, team2Id: 0, status: "upcoming", score: "", winnerId: null, isKnockout: true, weekPlayed: 4, tournamentCodes: [], teams: [] },
          { id: 9, team1Id: 0, team2Id: 0, status: "upcoming", score: "", winnerId: null, isKnockout: true, weekPlayed: 4, tournamentCodes: [], teams: [] }
        ]
      }
    ];

    const updated = updateDoubleEliminationBracket(emptyBracket, mockTeams, mockMatches);
    const m1 = updated[0].seeds[0];
    const m2 = updated[0].seeds[1];
    const m4 = updated[2].seeds[0];
    const m5 = updated[2].seeds[1];

    expect(m1.team1Id).toBe(mockTeams[0].id); // Seed 1
    expect(m1.teams[0].seed).toBe(1);
    expect(m1.teams[1].seed).toBe(4);
    expect(m2.teams[0].seed).toBe(2);
    expect(m2.teams[1].seed).toBe(3);
    expect(m4.teams[0].seed).toBe(5);
    expect(m5.teams[0].seed).toBe(6);
  });

  it('correctly provides detailed Adjusted Buchholz breakdown for playoff teams', () => {
    const { getPlayoffBuchholzBreakdown } = require('./index');
    const breakdown = getPlayoffBuchholzBreakdown(mockTeams, mockMatches);
    expect(breakdown.length).toBe(6);
    expect(breakdown[0].seed).toBe(1);
    expect(breakdown[0].opponents.length).toBeGreaterThan(0);
    expect(breakdown[0].calculationString).toBeDefined();
    expect(typeof breakdown[0].adjustedBuchholz).toBe('number');
  });
});
