import { EscapeRoomGameData, EscapeRoomStage } from '@/types/escapeRoom';

const STORAGE_KEY = 'escapeRoomData';
const STAGES_KEY = 'escapeRoomStages';

export const escapeRoomService = {
  async getStages(): Promise<EscapeRoomStage[]> {
    try {
      // Try to get from API first
      const response = await fetch('/api/escape-room/questions?count=4');
      if (response.ok) {
        const data = await response.json();
        return data.stages;
      }
    } catch (error) {
      console.error('Failed to load stages from API:', error);
    }
    
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(STAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load escape room stages from localStorage:', error);
      return [];
    }
  },

  async checkAnswer(stageId: number, userCode: string, sessionId?: string): Promise<{
    isCorrect: boolean;
    points: number;
    difficulty: string;
    hint: string;
    feedback?: string;
    lintingDetails?: any;
    method?: string;
  }> {
    try {
      const response = await fetch('/api/escape-room/check-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stageId,
          userCode,
          sessionId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          isCorrect: result.isCorrect,
          points: result.points,
          difficulty: result.difficulty,
          hint: result.hint,
          feedback: result.feedback,
          lintingDetails: result.lintingDetails,
          method: result.method,
        };
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to check answer via API:', error);
      // Fallback to local checking (simplified)
      return {
        isCorrect: false,
        points: 0,
        difficulty: 'medium',
        hint: 'Please try again',
        feedback: 'Error checking solution. Please try again!',
      };
    }
  },

  saveStages(stages: EscapeRoomStage[]): void {
    try {
      localStorage.setItem(STAGES_KEY, JSON.stringify(stages));
    } catch (error) {
      console.error('Failed to save escape room stages:', error);
    }
  },

  getGameData(): EscapeRoomGameData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load escape room game data:', error);
      return null;
    }
  },

  saveGameData(gameData: EscapeRoomGameData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
    } catch (error) {
      console.error('Failed to save escape room game data:', error);
    }
  },

  clearGameData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear escape room game data:', error);
    }
  },

  async createNewGame(): Promise<EscapeRoomGameData> {
    const stages = await this.getStages();
    const newGame: EscapeRoomGameData = {
      id: Date.now().toString(),
      startTime: new Date(),
      completedStages: [],
      won: false,
      stages: stages
    };
    this.saveGameData(newGame);
    return newGame;
  },

  updateGameProgress(gameId: string, completedStages: number[], won: boolean = false): void {
    try {
      const gameData = this.getGameData();
      if (gameData && gameData.id === gameId) {
        gameData.completedStages = completedStages;
        gameData.won = won;
        if (won) {
          gameData.endTime = new Date();
          gameData.finalTime = Math.floor((gameData.endTime.getTime() - gameData.startTime.getTime()) / 1000);
        }
        this.saveGameData(gameData);
      }
    } catch (error) {
      console.error('Failed to update game progress:', error);
    }
  }
};
