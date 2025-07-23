import { Player, Team, Group, BracketRound } from '../types';

// Let's create a pool of players. 4 captains, 16 regular players.
export const mockPlayers: Player[] = [
  // Captains
  { id: 1, name: 'Viper', elo: 2500, isCaptain: true },
  { id: 2, name: 'Ghost', elo: 2210, isCaptain: true },
  { id: 3, name: 'Phoenix', elo: 1900, isCaptain: true },
  { id: 4, name: 'Shadow', elo: 2320, isCaptain: true },
  // Regular Players
  { id: 5, name: 'Raptor', elo: 2350, isCaptain: false },
  { id: 6, name: 'Blaze', elo: 2340, isCaptain: false },
  { id: 7, name: 'Kilo', elo: 2330, isCaptain: false },
  { id: 8, name: 'Omega', elo: 2300, isCaptain: false },
  { id: 9, name: 'Fury', elo: 2280, isCaptain: false },
  { id: 10, name: 'Jinx', elo: 2250, isCaptain: false },
  { id: 11, name: 'Recon', elo: 2240, isCaptain: false },
  { id: 12, name: 'Nova', elo: 2220, isCaptain: false },
  { id: 13, name: 'Warden', elo: 2210, isCaptain: false },
  { id: 14, name: 'Bolt', elo: 2200, isCaptain: false },
  { id: 15, name: 'Spike', elo: 2180, isCaptain: false },
  { id: 16, name: 'Titan', elo: 2150, isCaptain: false },
  { id: 17, name: 'Gauge', elo: 2130, isCaptain: false },
  { id: 18, name: 'Rogue', elo: 2100, isCaptain: false },
  { id: 19, name: 'Hex', elo: 2080, isCaptain: false },
  { id: 20, name: 'Zero', elo: 2050, isCaptain: false },
];

export const draftedTeams: Team[] = [
  // This could be populated after a draft for other pages to use.
];

export const mockTeams: Team[] = [
  { id: 1, name: 'Cybernetic Champions', record: '2-1', matchHistory: [{ opponentId: 2, score: '2-1', result: 'W' }, { opponentId: 3, score: '1-2', result: 'L' }, { opponentId: 4, score: '2-0', result: 'W' }] },
  { id: 2, name: 'Quantum Questers', record: '2-1', matchHistory: [{ opponentId: 1, score: '1-2', result: 'L' }, { opponentId: 4, score: '2-1', result: 'W' }, { opponentId: 3, score: '2-0', result: 'W' }] },
  { id: 3, name: 'Digital Dynamos', record: '1-2', matchHistory: [{ opponentId: 4, score: '0-2', result: 'L' }, { opponentId: 1, score: '2-1', result: 'W' }, { opponentId: 2, score: '0-2', result: 'L' }] },
  { id: 4, name: 'Virtual Vanguards', record: '1-2', matchHistory: [{ opponentId: 3, score: '2-0', result: 'W' }, { opponentId: 2, score: '1-2', result: 'L' }, { opponentId: 1, score: '0-2', result: 'L' }] },
  { id: 5, name: 'Phoenix Phantoms', record: '3-0', matchHistory: [] },
  { id: 6, name: 'Goliath Gamers', record: '2-1', matchHistory: [] },
  { id: 7, name: 'Titanium Titans', record: '1-2', matchHistory: [] },
  { id: 8, name: 'Shadow Strikers', record: '0-3', matchHistory: [] },
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
    ],
  },
  {
    title: 'semifinals',
    seeds: [
      {
        id: 1,
        teams: [{ name: 'Cybernetic Champions' }, { name: 'Goliath Gamers' }],
      },
      {
        id: 2,
        teams: [{ name: 'Quantum Questers' }, { name: 'Phoenix Phantoms' }],
      },
    ],
  },
  {
    title: 'Finals',
    seeds: [
        {
          id: 3,
          teams: [ { name: 'TBD' }, { name: 'TBD' } ]
        }
    ]
  }
];
