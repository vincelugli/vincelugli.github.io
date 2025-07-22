import { Team, Group, BracketRound } from '../types';

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
