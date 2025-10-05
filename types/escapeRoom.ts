export interface EscapeRoomStage {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  testCases: string;
  expectedOutput: string;
  hints: string | null;
  starterCode: string;
  solution: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EscapeRoomGameState {
  timeLeft: number;
  customTime: number;
  timerStarted: boolean;
  currentStage: number;
  userCode: string;
  feedback: string;
  stagesCompleted: string[];
  gameWon: boolean;
  gameLost: boolean;
}

export interface EscapeRoomGameData {
  id: string;
  startTime: Date;
  endTime?: Date;
  completedStages: string[];
  finalTime?: number;
  won: boolean;
  stages: EscapeRoomStage[];
}

export type EscapeRoomAction = 'start' | 'submit' | 'skip' | 'reset' | 'win' | 'lose';
