
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

export interface GroupTournamentState {
  phase: 'GROUPS' | 'FINAL';
  groups: string[][];           // all groups (player names)
  currentGroupIndex: number;    // which group is playing now
  groupRounds: number;          // rounds per group
  finalRounds: number;          // rounds in the final
  advancersPerGroup: number[];  // how many advance from each group
  // players who advanced from completed groups (name + their group score)
  finalists: { name: string; groupScore: number }[];
  // all players with their results for display
  allGroupResults: {
    groupIndex: number;
    players: { name: string; score: number }[];
  }[];
}
