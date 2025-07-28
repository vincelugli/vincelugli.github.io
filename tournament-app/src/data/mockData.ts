import { Player, Team, Match, Group, BracketRound } from '../types';

export const mockTeams: Team[] = [
  { id: 1, name: 'Team Viper', captainId: 1, players: [], record: '2-0', wins: 2, losses: 0 },
  { id: 2, name: 'Team Ghost', captainId: 2, players: [], record: '0-2', wins: 0, losses: 2 },
  { id: 3, name: 'Team Phoenix', captainId: 3, players: [], record: '2-1', wins: 2, losses: 1 },
  { id: 4, name: 'Team Shadow', captainId: 4, players: [], record: '0-1', wins: 0, losses: 1 },
  { id: 5, name: 'Team Five', captainId: 1, players: [], record: '1-0', wins: 1, losses: 0 },
  { id: 6, name: 'Team Six', captainId: 2, players: [], record: '0-1', wins: 0, losses: 1 },
  { id: 7, name: 'Team Seven', captainId: 3, players: [], record: '1-0', wins: 1, losses: 0 },
  { id: 8, name: 'Team Eight', captainId: 4, players: [], record: '0-1', wins: 0, losses: 1 },
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
  { id: 1, name: 'Viper', elo: 2500, isCaptain: true, role: 'top', secondaryRoles: ['jungle', 'mid'] },
  { id: 2, name: 'Ghost', elo: 2210, isCaptain: true, role: 'jungle', secondaryRoles: [] },
  { id: 3, name: 'Phoenix', elo: 1900, isCaptain: true, role: 'mid', secondaryRoles: ['adc', 'support'] },
  { id: 4, name: 'Shadow', elo: 2320, isCaptain: true, role: 'adc', secondaryRoles: ['jungle'] },
  // Regular Players
  { id: 5, name: 'Raptor', elo: 2350, isCaptain: false, role: 'support', secondaryRoles: ['top', 'adc', 'mid'] },
  { id: 6, name: 'Blaze', elo: 2340, isCaptain: false, role: 'top', secondaryRoles: ['jungle'] },
  { id: 7, name: 'Kilo', elo: 2330, isCaptain: false, role: 'jungle', secondaryRoles: ['support'] },
  { id: 8, name: 'Omega', elo: 2300, isCaptain: false, role: 'mid', secondaryRoles: ['adc'] },
  { id: 9, name: 'Fury', elo: 2280, isCaptain: false, role: 'adc', secondaryRoles: [] },
  { id: 10, name: 'Jinx', elo: 2250, isCaptain: false, role: 'support', secondaryRoles: ['mid', 'top'] },
  { id: 11, name: 'Recon', elo: 2240, isCaptain: false, role: 'top', secondaryRoles: ['jungle', 'support'] },
  { id: 12, name: 'Nova', elo: 2220, isCaptain: false, role: 'jungle', secondaryRoles: ['adc'] },
  { id: 13, name: 'Warden', elo: 2210, isCaptain: false, role: 'mid', secondaryRoles: ['adc', 'top'] },
  { id: 14, name: 'Bolt', elo: 2200, isCaptain: false, role: 'adc', secondaryRoles: ['support'] },
  { id: 15, name: 'Spike', elo: 2180, isCaptain: false, role: 'support', secondaryRoles: [] },
  { id: 16, name: 'Titan', elo: 2150, isCaptain: false, role: 'top', secondaryRoles: ['mid', 'jungle'] },
  { id: 17, name: 'Gauge', elo: 2130, isCaptain: false, role: 'jungle', secondaryRoles: ['adc'] },
  { id: 18, name: 'Rogue', elo: 2100, isCaptain: false, role: 'mid', secondaryRoles: ['support', 'adc', 'jungle', 'top'] },
  { id: 19, name: 'Hex', elo: 2080, isCaptain: false, role: 'adc', secondaryRoles: ['support'] },
  { id: 20, name: 'Zero', elo: 2050, isCaptain: false, role: 'support', secondaryRoles: ['adc'] },
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
