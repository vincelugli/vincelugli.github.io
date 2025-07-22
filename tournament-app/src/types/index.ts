
export interface Match {
  opponentId: number;
  score: string;
  result: 'W' | 'L';
}

export interface Team {
  id: number;
  name: string;
  record: string;
  matchHistory: Match[];
}

export interface Group {
  id: number;
  name: string;
  teams: number[]; // Array of team IDs
}

// Types for the react-brackets library
export interface BracketTeam {
  name?: string;
}

export interface BracketSeed {
  id: number;
  teams: BracketTeam[];
}

export interface BracketRound {
  title: string;
  seeds: BracketSeed[];
}
