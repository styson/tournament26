// Player Types
export interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerStats {
  playerId: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  tournaments: TournamentParticipation[];
}

export interface TournamentParticipation {
  tournamentId: string;
  tournamentName: string;
  placement: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
}

// Tournament Types
export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: TournamentStatus;
  participants: string[]; // Array of player IDs
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const TournamentStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TournamentStatus = typeof TournamentStatus[keyof typeof TournamentStatus];

// Round Types
export interface Round {
  id: string;
  tournamentId: string;
  roundNumber: number;
  name: string;
  scenarios: string[]; // Array of scenario IDs (1-5 scenarios)
  games: string[]; // Array of game IDs
  status: RoundStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const RoundStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type RoundStatus = typeof RoundStatus[keyof typeof RoundStatus];

// Scenario Types
export interface Scenario {
  id: string;
  scenId?: string;
  title: string;
  description?: string;
  defenderNationality: Nationality;
  attackerNationality: Nationality;
  source?: string; // e.g., "Core Rulebook", "Expansion Pack 1"
  archiveId: string;
  createdAt: Date;
}

export const Nationality = {
  AMERICAN: 'AMERICAN',
  GERMAN: 'GERMAN',
  BRITISH: 'BRITISH',
  SOVIET: 'SOVIET',
  JAPANESE: 'JAPANESE',
  ITALIAN: 'ITALIAN',
  FRENCH: 'FRENCH',
  POLISH: 'POLISH',
  CHINESE: 'CHINESE',
} as const;

export type Nationality = typeof Nationality[keyof typeof Nationality];

// Game Types
export interface Game {
  id: string;
  tournamentId: string;
  roundId: string;
  scenarioId: string;
  defenderId: string; // Player ID
  attackerId: string; // Player ID
  winnerId?: string; // Player ID
  result?: GameResult;
  status: GameStatus;
  notes?: string;
  playedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const GameStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type GameStatus = typeof GameStatus[keyof typeof GameStatus];

export const GameResult = {
  DEFENDER_WIN: 'DEFENDER_WIN',
  ATTACKER_WIN: 'ATTACKER_WIN',
  DRAW: 'DRAW',
} as const;

export type GameResult = typeof GameResult[keyof typeof GameResult];

// Standings Types
export interface Standing {
  playerId: string;
  playerName: string;
  tournamentId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  opponents: OpponentRecord[];
  opponentWinRate: number; // Average opponent win rate (strength of schedule)
  points: number; // Can be calculated based on wins/losses/draws
}

export interface OpponentRecord {
  opponentId: string;
  opponentName: string;
  gameId: string;
  opponentWinsAtTimeOfPlay: number;
  opponentLossesAtTimeOfPlay: number;
  result: GameResult;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Form Types
export interface PlayerFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface TournamentFormData {
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
}

export interface GameFormData {
  roundId: string;
  scenarioId: string;
  defenderId: string;
  attackerId: string;
}

export interface GameResultFormData {
  winnerId: string;
  result: GameResult;
  notes?: string;
}
