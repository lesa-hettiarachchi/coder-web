import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Escape Room API Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Game Session API', () => {
    it('should create a new game session', async () => {
      const mockSession = {
        id: 'session-123',
        playerName: 'Test Player',
        timeLimit: 30,
        timeLeft: 1800,
        currentStage: 0,
        gameWon: false,
        gameLost: false
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession
      });

      const response = await fetch('/api/escape-room/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: 'Test Player',
          timeLimit: 30,
          timeLeft: 1800,
        }),
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/escape-room/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: 'Test Player',
          timeLimit: 30,
          timeLeft: 1800,
        }),
      });

      expect(response.ok).toBe(true);
      const session = await response.json();
      expect(session.id).toBe('session-123');
      expect(session.playerName).toBe('Test Player');
    });

    it('should update game session progress', async () => {
      const sessionId = 'session-123';
      const updateData = {
        currentStage: 2,
        timeLeft: 1500,
        stagesCompleted: [1, 2],
        userCode: 'print("hello world")',
        gameWon: false,
        gameLost: false
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...updateData, id: sessionId })
      });

      const response = await fetch(`/api/escape-room/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      expect(mockFetch).toHaveBeenCalledWith(`/api/escape-room/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      expect(response.ok).toBe(true);
    });

    it('should handle game session errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      const response = await fetch('/api/escape-room/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeLimit: 30,
          timeLeft: 1800,
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('Leaderboard API', () => {
    it('should fetch leaderboard data', async () => {
      const mockLeaderboard = [
        {
          id: '1',
          playerName: 'Top Player',
          finalScore: 950,
          timeCompleted: 1200,
          stagesCompleted: 4,
          gameMode: 'normal'
        },
        {
          id: '2',
          playerName: 'Second Player',
          finalScore: 800,
          timeCompleted: 1500,
          stagesCompleted: 4,
          gameMode: 'normal'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaderboard
      });

      const response = await fetch('/api/escape-room/leaderboard?limit=10');
      const leaderboard = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/api/escape-room/leaderboard?limit=10');
      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].playerName).toBe('Top Player');
      expect(leaderboard[0].finalScore).toBe(950);
    });

    it('should add entry to leaderboard', async () => {
      const leaderboardEntry = {
        playerName: 'New Player',
        finalScore: 750,
        timeCompleted: 1800,
        stagesCompleted: 4,
        gameMode: 'normal'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ ...leaderboardEntry, id: 'new-entry' })
      });

      const response = await fetch('/api/escape-room/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaderboardEntry),
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
    });
  });

  describe('Stage Management API', () => {
    it('should fetch escape room stages', async () => {
      const mockStages = [
        {
          id: 1,
          title: 'Stage 1: Format Code',
          description: 'Fix the formatting',
          starterCode: 'def hello():\nprint("hello")',
          solution: 'def hello():\n    print("hello")',
          hint: 'Add proper indentation',
          difficulty: 'easy',
          points: 100
        },
        {
          id: 2,
          title: 'Stage 2: Debug Code',
          description: 'Find the bug',
          starterCode: 'x = 5\ny = 0\nprint(x/y)',
          solution: 'x = 5\ny = 1\nprint(x/y)',
          hint: 'Check division by zero',
          difficulty: 'medium',
          points: 150
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStages
      });

      const response = await fetch('/api/escape-room/stages');
      const stages = await response.json();

      expect(stages).toHaveLength(2);
      expect(stages[0].title).toBe('Stage 1: Format Code');
      expect(stages[1].difficulty).toBe('medium');
    });

    it('should create new escape room stage', async () => {
      const newStage = {
        title: 'Stage 3: Generate Numbers',
        description: 'Generate numbers 0-100',
        starterCode: '# Write your code here',
        solution: 'for i in range(101):\n    print(i)',
        hint: 'Use a for loop with range',
        difficulty: 'hard',
        points: 200
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ ...newStage, id: 3 })
      });

      const response = await fetch('/api/escape-room/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStage),
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/escape-room/sessions');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle invalid JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      try {
        const response = await fetch('/api/escape-room/sessions');
        await response.json();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Invalid JSON');
      }
    });

    it('should validate required fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'timeLimit and timeLeft are required' })
      });

      const response = await fetch('/api/escape-room/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: 'Test Player'
          // Missing required fields
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });
});
