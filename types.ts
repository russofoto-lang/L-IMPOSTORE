
export enum GameState {
  SETUP = 'SETUP',
  INSTRUCTIONS = 'INSTRUCTIONS',
  REVEAL = 'REVEAL',
  PLAYING = 'PLAYING',
  VOTING = 'VOTING',
  WOLF_GUESS = 'WOLF_GUESS',
  RESULT = 'RESULT',
  LEADERBOARD = 'LEADERBOARD'
}

export type GameMode = 'SINGLE' | 'TOURNAMENT';

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
  enemyConfig: EnemyConfig; // Replaces enableMrWolf
}

export interface GameData {
  secretWord: string;
  players: Player[];
  impostorId: string; // Deprecated but kept for compatibility, prefer finding by role
  startTime: number;
  currentRound: number;
  winner?: 'players' | 'impostor' | 'mr_wolf' | 'enemies';
  winMethod?: 'vote' | 'guess' | 'time';
  isFinalRound?: boolean;
}
