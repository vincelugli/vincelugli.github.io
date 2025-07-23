export interface Match {
  id: string; // Use a string for unique IDs like from a DB
  team1Id: number;
  team2Id: number;
  status: 'upcoming' | 'completed';
  tournamentCode: string; // The code for players to join
  winnerId?: number | null; // Only for 'completed' status
  score?: string; // e.g., "2-1", only for 'completed' status
}

// Update the Team type to be simpler, as matches are now separate
export interface Team {
  id: number;
  name: string;
  captainId: number;
  players: Player[];
  wins: number;
  losses: number;
  record?: string;
  matchHistory?: Match[];
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

export interface Player {
  id: number;
  name: string;
  elo: number;
  isCaptain: boolean;
  teamId?: number | null; // Use optional or null to indicate they are undrafted
}
