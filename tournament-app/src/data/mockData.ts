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

export const mockMatches: Match[] = [
  // A completed match
  {
    id: 'm1',
    team1Id: 1,
    team2Id: 2,
    status: 'completed',
    tournamentCode: 'XYZ123',
    winnerId: 1,
    score: '2-1',
  },
  // An upcoming match
  {
    id: 'm2',
    team1Id: 1,
    team2Id: 3,
    status: 'upcoming',
    tournamentCode: 'ABC789',
  },
  // Another upcoming match for a different team
  {
    id: 'm3',
    team1Id: 2,
    team2Id: 4,
    status: 'upcoming',
    tournamentCode: 'DEF456',
  }
];

// Let's create a pool of players. 4 captains, 16 regular players.
export const mockPlayers: Player[] = [
  // Captains
  { id: 1, name: 'Viper', rankTier: 'Master', rankDivision: 42, isCaptain: true, role: 'top', secondaryRoles: ['jungle', 'mid'] },
  { id: 2, name: 'Ghost', rankTier: 'Master', rankDivision: 21, isCaptain: true, role: 'jungle', secondaryRoles: [] },
  { id: 3, name: 'Phoenix', rankTier: 'Diamond', rankDivision: 3, isCaptain: true, role: 'mid', secondaryRoles: ['adc', 'support'] },
  { id: 4, name: 'Shadow', rankTier: 'Diamond', rankDivision: 4, isCaptain: true, role: 'adc', secondaryRoles: ['jungle'] },
  // Regular Players
  { id: 5, name: 'Raptor', rankTier: 'Emerald', rankDivision: 1, isCaptain: false, role: 'support', secondaryRoles: ['top', 'adc', 'mid'] },
  { id: 6, name: 'Blaze', rankTier: 'Emerald', rankDivision: 2, isCaptain: false, role: 'top', secondaryRoles: ['jungle'] },
  { id: 7, name: 'Kilo', rankTier: 'Emerald', rankDivision: 3, isCaptain: false, role: 'jungle', secondaryRoles: ['support'] },
  { id: 8, name: 'Omega', rankTier: 'Emerald', rankDivision: 3, isCaptain: false, role: 'mid', secondaryRoles: ['adc'] },
  { id: 9, name: 'Fury', rankTier: 'Emerald', rankDivision: 4, isCaptain: false, role: 'adc', secondaryRoles: [] },
  { id: 10, name: 'Jinx', rankTier: 'Emerald', rankDivision: 4, isCaptain: false, role: 'support', secondaryRoles: ['mid', 'top'] },
  { id: 11, name: 'Recon', rankTier: 'Platinum', rankDivision: 1, isCaptain: false, role: 'top', secondaryRoles: ['jungle', 'support'] },
  { id: 12, name: 'Nova', rankTier: 'Platinum', rankDivision: 2, isCaptain: false, role: 'jungle', secondaryRoles: ['adc'] },
  { id: 13, name: 'Warden', rankTier: 'Platinum', rankDivision: 4, isCaptain: false, role: 'mid', secondaryRoles: ['adc', 'top'] },
  { id: 14, name: 'Bolt', rankTier: 'Platinum', rankDivision: 4, isCaptain: false, role: 'adc', secondaryRoles: ['support'] },
  { id: 15, name: 'Spike', rankTier: 'Platinum', rankDivision: 3, isCaptain: false, role: 'support', secondaryRoles: [] },
  { id: 16, name: 'Titan', rankTier: 'Gold', rankDivision: 1, isCaptain: false, role: 'top', secondaryRoles: ['mid', 'jungle'] },
  { id: 17, name: 'Gauge', rankTier: 'Gold', rankDivision: 4, isCaptain: false, role: 'jungle', secondaryRoles: ['adc'] },
  { id: 18, name: 'Rogue', rankTier: 'Silver', rankDivision: 2, isCaptain: false, role: 'mid', secondaryRoles: ['support', 'adc', 'jungle', 'top'] },
  { id: 19, name: 'Hex', rankTier: 'Bronze', rankDivision: 2, isCaptain: false, role: 'adc', secondaryRoles: ['support'] },
  { id: 20, name: 'Zero', rankTier: 'Iron', rankDivision: 1, isCaptain: false, role: 'support', secondaryRoles: ['adc'] },
];

export const draftedTeams: Team[] = [
  // This could be populated after a draft for other pages to use.
];

export const mockGroups: Group[] = [
  { id: 1, name: 'Group A', teams: [1, 2, 3, 4] },
  { id: 2, name: 'Group B', teams: [5, 6, 7, 8] },
];

export const mockBracket: BracketRound[] = [
  {
    title: 'Round 1',
    seeds: [
      {
        id: 1,
        teams: [{ name: 'Cybernetic Champions' }, { name: 'Goliath Gamers' }],
      },
      {
        id: 2,
        teams: [{ name: 'Quantum Questers' }, { name: 'Phoenix Phantoms' }],
      },
      {
        id: 3,
        teams: [{ name: 'team 3' }, { name: 'three' }],
      },
      {
        id: 4,
        teams: [{ name: 'team 4' }, { name: 'four' }],
      },
      {
        id: 5,
        teams: [{ name: 'team 5' }, { name: 'five' }],
      },
      {
        id: 6,
        teams: [{ name: 'team 6' }, { name: 'six' }],
      },
      {
        id: 7,
        teams: [{ name: 'team 7' }, { name: 'seven' }],
      },
      {
        id: 8,
        teams: [{ name: 'team 8' }, { name: 'eight' }],
      },
    ],
  },
  {
    title: 'quarterfinals',
    seeds: [
      {
        id: 1,
        teams: [],
      },
      {
        id: 2,
        teams: [],
      },
      {
        id: 3,
        teams: [],
      },
      {
        id: 4,
        teams: [],
      },
    ],
  },
  {
    title: 'semifinals',
    seeds: [
      {
        id: 1,
        teams: [],
      },
      {
        id: 2,
        teams: [],
      },
    ],
  },
  {
    title: 'Finals',
    seeds: [
        {
          id: 3,
          teams: [  ]
        }
    ]
  }
];
