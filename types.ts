
export enum GameState {
  SETUP = 'SETUP',
  REVEAL = 'REVEAL',
  PLAYING = 'PLAYING',
  VOTING = 'VOTING',
  RESULT = 'RESULT'
}

export interface Player {
  id: string;
  name: string;
  isImpostor: boolean;
  isRevealed: boolean;
}

export interface GameSettings {
  players: string[];
  timerDuration: number; // in seconds
}

export interface GameData {
  secretWord: string;
  players: Player[];
  impostorId: string;
  startTime: number;
}
