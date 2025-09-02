import { Timestamp } from 'firebase/firestore';

export interface Match {
  id: string|number; // Use a string for unique IDs like from a DB
  team1Id: number;
  team2Id: number;
  status: 'upcoming' | 'completed';
  tournamentCodes: string[]; // The code for players to join
  weekPlayed: number;
  winnerId?: number | null; // Only for 'completed' status
  score?: string; // e.g., "2-1", only for 'completed' status
}

export interface Team {
  id: number;
  name: string;
  captainId: number;
  players: number[];
  wins: number;
  losses: number;
  gameWins: number;
  gameLosses: number;
  record?: string;
  gameRecord?: string;
  matchHistory?: Match[];
}

export interface DraftTeam {
  id: number;
  name: string;
  captainId: number;
  players: Player[];
  wins: number;
  losses: number;
  gameWins: number;
  gameLosses: number;
  record?: string;
  gameRecord?: string;
  matchHistory?: Match[];
}

export interface Group {
  id: number;
  name: string;
  teams: number[]; // Array of team IDs
}

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
  peakRankTier: string;
  peakRankDivision: number;
  soloRankTier: string;
  soloRankDivision: number;
  flexRankTier: string;
  flexRankDivision: number;
  timezone: string;
  isCaptain: boolean;
  role: string;
  secondaryRoles: string[];
  teamId?: number | null;
}

export interface DraftState {
  teams: DraftTeam[];
  pickOrder: (number | string)[];
  availablePlayers: Player[];
  completedPicks: { [pickIndex: number]: number }; // Maps pick index to drafted player ID
  currentPickIndex: number; // Index of the current pick in the pickOrder
  pickEndsAt?: number | null; // End time in milliseconds
  draftId: string;
}

export interface SignUpData {
  mainSummonerName: string;
  location: string;
  role: 'Player' | 'Sub' | 'Coach';
  peakRank: string;
  peakRankSeason: string;
  altSummonerNames: string;
  submittedAt: Timestamp; // To track when the sign-up happened
}

export interface SubPlayer {
  name: string;
  peakRankTier: string;
  peakRankDivision: number;
  soloRankTier: string;
  soloRankDivision: number;
  flexRankTier: string;
  flexRankDivision: number;
  timezone: string;
  contact: string;
  role: string;
  secondaryRoles: string[];
}

export interface TournamentCode {
  code: string;
  matchId: number|string;
}