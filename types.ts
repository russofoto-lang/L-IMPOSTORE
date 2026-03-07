
export enum GameState {
  SETUP = 'SETUP',
  INSTRUCTIONS = 'INSTRUCTIONS',
  REVEAL = 'REVEAL',
  PLAYING = 'PLAYING',
  VOTING = 'VOTING',
  WOLF_GUESS = 'WOLF_GUESS',
  RESULT = 'RESULT',
  LEADERBOARD = 'LEADERBOARD',
  GROUP_LOBBY = 'GROUP_LOBBY',
  TOURNAMENT_WINNERS = 'TOURNAMENT_WINNERS'
}

export type GameMode = 'SINGLE' | 'TOURNAMENT' | 'GROUP_TOURNAMENT';

export type Role = 'CIVILIAN' | 'IMPOSTOR' | 'MR_WOLF';

export type EnemyConfig = 'IMPOSTOR_ONLY' | 'WOLF_ONLY' | 'BOTH';

export interface Player {
  id: string;
  name: string;
  role: Role;
  isRevealed: boolean;
  score: number;
  impostorWins: number;
}

export interface GameSettings {
  players: string[];
  timerDuration: number;
  mode: GameMode;
  totalRounds: number;
  enemyConfig: EnemyConfig;
  selectedCategories: string[];
  showCategoryHint: boolean;
}

export interface GameData {
  secretWord: string;
  wordCategory: string;
  players: Player[];
  startTime: number;
  currentRound: number;
  winner?: 'players' | 'impostor' | 'mr_wolf' | 'enemies';
  winMethod?: 'vote' | 'guess' | 'time';
  isFinalRound?: boolean;
  votedPlayer?: Player;
  usedWords: string[];
}

export interface WildCardCandidate {
  name: string;
  groupScore: number;
  groupRank: number;
  impostorWins: number;
}

export interface GroupTournamentState {
  phase: 'GROUPS' | 'FINAL';
  groups: string[][];           // all groups (player names)
  currentGroupIndex: number;    // which group is playing now
  groupRounds: number;          // rounds per group
  finalRounds: number;          // rounds in the final
  advancersPerGroup: number[];  // direct advances per group
  finalists: { name: string; groupScore: number }[];
  allGroupResults: {
    groupIndex: number;
    players: { name: string; score: number }[];
  }[];
  // Wild card qualification system
  directQualifiers: { name: string; groupScore: number; impostorWins: number }[];
  wildCardPool: WildCardCandidate[];
  wildCardsNeeded: number;
  numGroups: number;
}

// Shared via localStorage for dashboard projection
export interface DashboardState {
  gameState: string;
  tournamentPhase: 'GROUPS' | 'FINAL' | null;
  groupLabel: string;
  roundLabel: string;
  currentPlayers: { name: string; score: number }[];
  allGroups: string[][];
  currentGroupIndex: number;
  directQualifiers: { name: string; groupScore: number }[];
  wildCardPool: WildCardCandidate[];
  wildCardsNeeded: number;
  finalists: { name: string; groupScore: number }[];
  numGroups: number;
  timestamp: number;
}
