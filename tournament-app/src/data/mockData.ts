import { Player, Team, Match, Group, BracketRound } from '../types';

export const mockTeams: Team[] = [
  { id: 1, name: 'Team Viper', captainId: 1, players: [], record: '2-0', wins: 2, losses: 0, gameWins: 4, gameLosses: 1, gameRecord: "4-1" },
  { id: 2, name: 'Team Ghost', captainId: 2, players: [], record: '0-2', wins: 0, losses: 2, gameWins: 2, gameLosses: 4, gameRecord: "2-4" },
  { id: 3, name: 'Team Phoenix', captainId: 3, players: [], record: '2-1', wins: 2, losses: 1, gameWins: 5, gameLosses: 3, gameRecord: "5-3" },
  { id: 4, name: 'Team Shadow', captainId: 4, players: [], record: '0-1', wins: 0, losses: 1, gameWins: 0, gameLosses: 2, gameRecord: "0-2" },
  { id: 5, name: 'Team Five', captainId: 1, players: [], record: '1-0', wins: 1, losses: 0, gameWins: 2, gameLosses: 1, gameRecord: "2-1" },
  { id: 6, name: 'Team Six', captainId: 2, players: [], record: '0-1', wins: 0, losses: 1, gameWins: 0, gameLosses: 2, gameRecord: "0-2" },
  { id: 7, name: 'Team Seven', captainId: 3, players: [], record: '1-0', wins: 1, losses: 0, gameWins: 2, gameLosses: 1, gameRecord: "2-1" },
  { id: 8, name: 'Team Eight', captainId: 4, players: [], record: '0-1', wins: 0, losses: 1, gameWins: 0, gameLosses: 2, gameRecord: "0-2" },
];

// Mock players are in DB.

export const draftedTeams: Team[] = [
  // This could be populated after a draft for other pages to use.
];

export const mockGroups: Group[] = [
  { "id": 1, "name": "Group A", "teams": [1,4,7,10] },
  { "id": 2, "name": "Group B", "teams": [2,5,8,11] },
  { "id": 3, "name": "Group C", "teams": [3,6,9] }
];

export const mockBracket: BracketRound[] = [
  {
    title: 'quarterfinals',
    seeds: [
      {
        id: 1,
        team1Id: 1,
        team2Id: 2,
        tournamentCodes: [],
        weekPlayed: 1,
        winnerId: null,
        score: "0-0",
        status: "upcoming",
        teams: [{ name: 'Gold Digger' }, { name: 'Team reuben12358#NA1' }],
      },
      {
        id: 2,
        team1Id: 1,
        team2Id: 2,
        tournamentCodes: [],
        weekPlayed: 1,
        winnerId: null,
        score: "0-0",
        status: "upcoming",
        teams: [{ name: 'Team cartonnnn#crisp' }, { name: 'Team Belindel#888' }],
      },
      {
        id: 3,
        team1Id: 1,
        team2Id: 2,
        tournamentCodes: [],
        weekPlayed: 1,
        winnerId: null,
        score: "0-0",
        status: "upcoming",
        teams: [{ name: 'Team DA VINKl#NA1' }, { name: 'Team of Theseus' }],
      },
      {
        id: 4,
        team1Id: 1,
        team2Id: 2,
        tournamentCodes: [],
        weekPlayed: 1,
        winnerId: null,
        score: "0-0",
        status: "upcoming",
        teams: [{ name: '10xKO' }, { name: 'Team Kiwi #Shiba' }],
      },
    ],
  },
  {
    title: 'semifinals',
    seeds: [
      {
        id: 1,
        team1Id: 1,
        team2Id: 2,
        tournamentCodes: [],
        weekPlayed: 1,
        winnerId: null,
        score: "0-0",
        status: "upcoming",
        teams: [],
      },
      {
        id: 2,
        team1Id: 1,
        team2Id: 2,
        tournamentCodes: [],
        weekPlayed: 1,
        winnerId: null,
        score: "0-0",
        status: "upcoming",
        teams: [],
      },
    ],
  },
  {
    title: 'Finals',
    seeds: [
      {
        id: 3,
        team1Id: 1,
        team2Id: 2,
        tournamentCodes: [],
        weekPlayed: 1,
        winnerId: null,
        score: "0-0",
        status: "upcoming",
        teams: [  ]
      }
    ]
  }
];
