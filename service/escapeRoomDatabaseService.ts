import { prisma } from '@/lib/prisma';
import { EscapeRoomGameData, EscapeRoomStage } from '@/types/escapeRoom';

export const escapeRoomDatabaseService = {

  async createGameSession(data: {
    playerName?: string;
    timeLimit: number;
    timeLeft: number;
  }) {
    try {
      const session = await prisma.gameSession.create({
        data: {
          playerName: data.playerName,
          timeLimit: data.timeLimit,
          timeLeft: data.timeLeft,
        },
      });
      return session;
    } catch (error) {
      console.error('Failed to create game session:', error);
      throw error;
    }
  },

  async updateGameSession(sessionId: string, data: {
    currentStage?: number;
    timeLeft?: number;
    stagesCompleted?: number[];
    userCode?: string;
    gameWon?: boolean;
    gameLost?: boolean;
    finalScore?: number;
  }) {
    try {
      const session = await prisma.gameSession.update({
        where: { id: sessionId },
        data: {
          ...data,
          stagesCompleted: data.stagesCompleted ? JSON.stringify(data.stagesCompleted) : undefined,
          endTime: (data.gameWon || data.gameLost) ? new Date() : undefined,
        },
      });
      return session;
    } catch (error) {
      console.error('Failed to update game session:', error);
      throw error;
    }
  },

  async getGameSession(sessionId: string) {
    try {
      const session = await prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: {
          stageProgress: true,
          gameEvents: true,
        },
      });
      return session;
    } catch (error) {
      console.error('Failed to get game session:', error);
      throw error;
    }
  },

  async deleteGameSession(sessionId: string) {
    try {
      await prisma.gameSession.delete({
        where: { id: sessionId },
      });
      return true;
    } catch (error) {
      console.error('Failed to delete game session:', error);
      throw error;
    }
  },

  // Stage Progress Management
  async updateStageProgress(sessionId: string, stageId: number, data: {
    userCode: string;
    isCompleted?: boolean;
    attempts?: number;
    hintsUsed?: number;
    timeSpent?: number;
  }) {
    try {
      const stageProgress = await prisma.stageProgress.upsert({
        where: {
          sessionId_stageId: {
            sessionId,
            stageId,
          },
        },
        update: {
          ...data,
          completedAt: data.isCompleted ? new Date() : undefined,
        },
        create: {
          sessionId,
          stageId,
          ...data,
          completedAt: data.isCompleted ? new Date() : undefined,
        },
      });
      return stageProgress;
    } catch (error) {
      console.error('Failed to update stage progress:', error);
      throw error;
    }
  },

  async getStageProgress(sessionId: string, stageId: number) {
    try {
      const progress = await prisma.stageProgress.findUnique({
        where: {
          sessionId_stageId: {
            sessionId,
            stageId,
          },
        },
      });
      return progress;
    } catch (error) {
      console.error('Failed to get stage progress:', error);
      throw error;
    }
  },

  // Game Events
  async logGameEvent(sessionId: string, eventType: string, eventData?: any) {
    try {
      const event = await prisma.gameEvent.create({
        data: {
          sessionId,
          eventType,
          eventData: eventData ? JSON.stringify(eventData) : null,
        },
      });
      return event;
    } catch (error) {
      console.error('Failed to log game event:', error);
      throw error;
    }
  },

  // Leaderboard
  async addToLeaderboard(data: {
    playerName: string;
    finalScore: number;
    leaderboardScore: number;
    timeCompleted: number;
    timeLimit: number;
    maxPossibleScore: number;
    stagesCompleted: number;
    gameMode?: string;
  }) {
    try {
      const entry = await prisma.leaderboard.create({
        data: {
          playerName: data.playerName,
          finalScore: data.finalScore,
          leaderboardScore: data.leaderboardScore,
          timeCompleted: data.timeCompleted,
          timeLimit: data.timeLimit,
          maxPossibleScore: data.maxPossibleScore,
          stagesCompleted: data.stagesCompleted,
          gameMode: data.gameMode || 'normal',
        },
      });
      return entry;
    } catch (error) {
      console.error('Failed to add to leaderboard:', error);
      throw error;
    }
  },

  async getLeaderboard(limit: number = 10) {
    try {
      const leaderboard = await prisma.leaderboard.findMany({
        orderBy: [
          { leaderboardScore: 'desc' },
          { timeCompleted: 'asc' },
        ],
        take: limit,
      });
      return leaderboard;
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      throw error;
    }
  },

  async clearLeaderboard() {
    try {
      await prisma.leaderboard.deleteMany({});
      return true;
    } catch (error) {
      console.error('Failed to clear leaderboard:', error);
      throw error;
    }
  },

  // Escape Room Stages Management
  async getEscapeRoomStages() {
    try {
      const stages = await prisma.escapeRoomStage.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' },
      });
      return stages;
    } catch (error) {
      console.error('Failed to get escape room stages:', error);
      throw error;
    }
  },

  async createEscapeRoomStage(stage: Omit<EscapeRoomStage, 'id'>) {
    try {
      const newStage = await prisma.escapeRoomStage.create({
        data: {
          title: stage.title,
          description: stage.description,
          starterCode: stage.starterCode,
          solution: stage.solution,
          hint: stage.hint,
          difficulty: stage.difficulty || 'medium',
          points: stage.points || 100,
        },
      });
      return newStage;
    } catch (error) {
      console.error('Failed to create escape room stage:', error);
      throw error;
    }
  },

  async updateEscapeRoomStage(id: number, data: Partial<Omit<EscapeRoomStage, 'id'>>) {
    try {
      const stage = await prisma.escapeRoomStage.update({
        where: { id },
        data,
      });
      return stage;
    } catch (error) {
      console.error('Failed to update escape room stage:', error);
      throw error;
    }
  },

  async deleteEscapeRoomStage(id: number) {
    try {
      await prisma.escapeRoomStage.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Failed to delete escape room stage:', error);
      throw error;
    }
  },

  // Statistics
  async getGameStatistics() {
    try {
      const totalSessions = await prisma.gameSession.count();
      const completedSessions = await prisma.gameSession.count({
        where: { gameWon: true },
      });
      const averageScore = await prisma.gameSession.aggregate({
        _avg: {
          finalScore: true,
        },
        where: {
          finalScore: { not: null },
        },
      });
      const averageTime = await prisma.gameSession.aggregate({
        _avg: {
          timeLeft: true,
        },
        where: {
          gameWon: true,
        },
      });

      return {
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
        averageScore: averageScore._avg.finalScore || 0,
        averageTimeLeft: averageTime._avg.timeLeft || 0,
      };
    } catch (error) {
      console.error('Failed to get game statistics:', error);
      throw error;
    }
  },
};
