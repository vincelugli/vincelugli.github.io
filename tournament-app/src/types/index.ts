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
  team1Wins?: number;
  team2Wins?: number;
  isKnockout?: boolean;
  stage?: string;
  scheduledTime?: string;
  isCasted?: boolean;
  twitchChannel?: string;
  coinFlipResult?: 'heads' | 'tails' | null;
  firstGameSideSelection?: 'blue' | 'red' | null;
}

export interface TeamLogoConfig {
  backgroundShape: string;
  backgroundColor: string;
  foregroundShape: string;
  foregroundColor: string;
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
  logo?: TeamLogoConfig;
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
  id?: number;
  name?: string;
  seed?: number;
}

export interface BracketSeed {
  id: number;
  status: 'upcoming' | 'completed';
  teams: BracketTeam[];
  team1Id: number;
  team2Id: number;
  tournamentCodes: string[];
  weekPlayed: number;
  winnerId?: number | null;
  score?: string;
  isKnockout: boolean;
  stage?: string;
  coinFlipResult?: 'heads' | 'tails' | null;
  firstGameSideSelection?: 'blue' | 'red' | null;
}

export interface BracketRound {
  title: string;
  seeds: BracketSeed[];
}

export interface ChampionStat {
  name: string;
  games: number;
  winrate: string;
  kills: string;
  deaths: string;
  assists: string;
  kda: string;
  csPerMin: string;
}
export interface PlayerAchievement {
  title: string;
  type: 'winner' | 'runner_up';
  division: 'gold' | 'master';
  year: number;
}

export interface Player {
  id: number;
  name: string;
  elo?: number;
  self_reported_elo?: number;
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
  contact?: string;
  mostPlayedChampions?: (string | ChampionStat)[];
  rankedWinrate?: string;
  rolePreferences?: {
    top: number;
    jungle: number;
    mid: number;
    adc: number;
    support: number;
  };
  additionalStats?: { [key: string]: string | number };
  previousSeasons?: {
    season: string;
    tier: string;
    division: number;
  }[];
}

export interface DraftState {
  teams: DraftTeam[];
  pickOrder: (number | string)[];
  availablePlayers: Player[];
  completedPicks: { [pickIndex: number]: number }; // Maps pick index to drafted player ID
  currentPickIndex: number; // Index of the current pick in the pickOrder
  pickEndsAt?: number | null; // End time in milliseconds
  draftId: string;
  skippedOriginalTeams?: { [pickIndex: number]: number };
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

export interface SubPlayer extends Player {
  contact: string;
}

export interface TournamentCode {
  code: string;
  matchId: number|string;
  status: string;
  winnerId: number;
  isKnockout?: boolean;
}

export interface MatchResult {
  code: string;
  result: MatchResultData;
}

export interface PlayerResult {
  playerName: string;
  championName: string;      // e.g., "Aatrox", "Fiddlesticks"
  summonerSpells: string[];  // e.g., ["SummonerFlash", "SummonerTeleport"]
  items: (number | null)[];  // An array of 6 item IDs or null for empty slots
  kills: number;
  deaths: number;
  assists: number;
}

export interface TeamResult {
  bans: string[];            // An array of 5 champion names
  players: PlayerResult[];
}

export interface MatchResultData {
  blueTeam: TeamResult;
  redTeam: TeamResult;
  gameDuration: number;
  winner: number;
}

export interface TeamAvailability {
  teamId: number;
  // Key is "Day-Time", e.g., "Monday-18:00"
  // Value is an array of player IDs available in that slot
  slots: { [key: string]: number[] };
}

export interface PowerRankingItem {
  rank: number;
  change: string;
  team: string;
  teamId?: number | null;
  roster: string;
  comments: string;
}

export interface WeeklyPowerRanking {
  week: number;
  updatedAt: number;
  rankings: PowerRankingItem[];
}


