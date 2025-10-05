export interface EscapeRoomStage {
  id: number;
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  hint: string;
  difficulty: string;
  points: number;
  isActive: boolean;
}

export interface EscapeRoomGameState {
  timeLeft: number;
  customTime: number;
  timerStarted: boolean;
  currentStage: number;
  userCode: string;
  feedback: string;
  stagesCompleted: number[];
  gameWon: boolean;
  gameLost: boolean;
  currentPoints: number;
  hintsUsed: number[];
  showHint: boolean;
  playerName: string;
}

export interface EscapeRoomGameData {
  id: string;
  startTime: Date;
  endTime?: Date;
  completedStages: number[];
  finalTime?: number;
  won: boolean;
  stages: EscapeRoomStage[];
}

export type EscapeRoomAction = 'start' | 'submit' | 'skip' | 'reset' | 'win' | 'lose';
