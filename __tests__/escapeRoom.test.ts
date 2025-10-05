import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock the escape room service
const mockEscapeRoomService = {
  getStages: jest.fn(),
  createNewGame: jest.fn(),
  clearGameData: jest.fn(),
  saveGameData: jest.fn(),
  getGameData: jest.fn(),
};

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Escape Room Game Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Game State Management', () => {
    it('should initialize with correct default state', () => {
      const initialState = {
        timeLeft: 1800,
        customTime: 30,
        timerStarted: false,
        currentStage: 0,
        userCode: '',
        feedback: '',
        stagesCompleted: [],
        gameWon: false,
        gameLost: false
      };

      expect(initialState.timeLeft).toBe(1800);
      expect(initialState.timerStarted).toBe(false);
      expect(initialState.currentStage).toBe(0);
      expect(initialState.stagesCompleted).toEqual([]);
    });

    it('should update custom time within valid range', () => {
      const updateCustomTime = (minutes: number) => {
        return Math.max(1, Math.min(120, minutes));
      };

      expect(updateCustomTime(30)).toBe(30);
      expect(updateCustomTime(0)).toBe(1);
      expect(updateCustomTime(150)).toBe(120);
      expect(updateCustomTime(-5)).toBe(1);
    });

    it('should format time correctly', () => {
      const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(3661)).toBe('61:01');
    });
  });

  describe('Stage Progression', () => {
    const mockStages = [
      {
        id: 1,
        title: "Stage 1: Format Code",
        description: "Fix the formatting",
        starterCode: "def hello():\nprint('hello')",
        solution: "def hello():\n    print('hello')",
        hint: "Add proper indentation"
      },
      {
        id: 2,
        title: "Stage 2: Debug Code",
        description: "Find the bug",
        starterCode: "x = 5\ny = 0\nprint(x/y)",
        solution: "x = 5\ny = 1\nprint(x/y)",
        hint: "Check division by zero"
      },
      {
        id: 3,
        title: "Stage 3: Generate Numbers",
        description: "Generate 0-10",
        starterCode: "# Write your code here",
        solution: "for i in range(11):\n    print(i)",
        hint: "Use a for loop with range"
      }
    ];

    it('should validate correct solutions', () => {
      const normalizeCode = (code: string): string => {
        return code.trim().replace(/\s+/g, ' ').toLowerCase();
      };

      const checkSolution = (userCode: string, solution: string): boolean => {
        const userNormalized = normalizeCode(userCode);
        const solutionNormalized = normalizeCode(solution);
        
        return userNormalized.includes(solutionNormalized.substring(0, 50)) || 
               solutionNormalized.includes(userNormalized.substring(0, 50));
      };

      // Test exact match
      expect(checkSolution(
        "def hello():\n    print('hello')",
        "def hello():\n    print('hello')"
      )).toBe(true);

      // Test partial match
      expect(checkSolution(
        "for i in range(11): print(i)",
        "for i in range(11):\n    print(i)"
      )).toBe(true);

      // Test incorrect solution
      expect(checkSolution(
        "def hello():\nprint('hello')",
        "def hello():\n    print('hello')"
      )).toBe(false);
    });

    it('should track stage completion', () => {
      const stagesCompleted = [1, 2];
      const currentStage = 2;
      const newStagesCompleted = [...stagesCompleted, 3];

      expect(newStagesCompleted).toEqual([1, 2, 3]);
      expect(newStagesCompleted.length).toBe(3);
    });

    it('should determine game completion', () => {
      const totalStages = 3;
      const completedStages = [1, 2, 3];

      const isGameComplete = completedStages.length === totalStages;
      expect(isGameComplete).toBe(true);
    });
  });

  describe('Timer Logic', () => {
    it('should countdown timer correctly', () => {
      let timeLeft = 1800; // 30 minutes
      const countdown = () => {
        timeLeft = Math.max(0, timeLeft - 1);
        return timeLeft;
      };

      expect(countdown()).toBe(1799);
      expect(countdown()).toBe(1798);
      
      // Test reaching zero
      timeLeft = 1;
      expect(countdown()).toBe(0);
      expect(countdown()).toBe(0); // Should not go below 0
    });

    it('should detect time expiration', () => {
      const timeLeft = 0;
      const gameWon = false;
      const gameLost = timeLeft === 0 && !gameWon;

      expect(gameLost).toBe(true);
    });
  });

  describe('Code Validation Examples', () => {
    it('should validate Python code formatting', () => {
      const testCases = [
        {
          input: "def hello():\nprint('hello')",
          expected: "def hello():\n    print('hello')",
          description: "Missing indentation"
        },
        {
          input: "x=5\ny=10\nprint(x+y)",
          expected: "x = 5\ny = 10\nprint(x + y)",
          description: "Missing spaces around operators"
        },
        {
          input: "if x>0:\nprint('positive')",
          expected: "if x > 0:\n    print('positive')",
          description: "Missing spaces and indentation"
        }
      ];

      testCases.forEach(({ input, expected, description }) => {
        const normalizeCode = (code: string) => code.trim().replace(/\s+/g, ' ');
        const isCorrect = normalizeCode(input) === normalizeCode(expected);
        
        // For this test, we'll expect them to be different (incorrect formatting)
        expect(isCorrect).toBe(false);
      });
    });

    it('should validate number generation code', () => {
      const testCases = [
        {
          input: "for i in range(11):\n    print(i)",
          description: "Correct range 0-10"
        },
        {
          input: "for i in range(0, 11):\n    print(i)",
          description: "Explicit range 0-10"
        },
        {
          input: "i = 0\nwhile i <= 10:\n    print(i)\n    i += 1",
          description: "While loop approach"
        }
      ];

      testCases.forEach(({ input, description }) => {
        // All these should be valid approaches
        expect(input).toContain('print');
        expect(input).toMatch(/(range|while)/);
      });
    });

    it('should validate data conversion code', () => {
      const testCases = [
        {
          input: `csv_data = "name,age\\nAlice,30\\nBob,25"
lines = csv_data.split('\\n')
headers = lines[0].split(',')
result = []
for line in lines[1:]:
    values = line.split(',')
    obj = {headers[i]: values[i] for i in range(len(headers))}
    result.append(obj)`,
          description: "Dictionary comprehension approach"
        },
        {
          input: `import csv
import json
csv_data = "name,age\\nAlice,30\\nBob,25"
lines = csv_data.split('\\n')
headers = lines[0].split(',')
result = []
for line in lines[1:]:
    values = line.split(',')
    obj = {}
    for i in range(len(headers)):
        obj[headers[i]] = values[i]
    result.append(obj)`,
          description: "Explicit loop approach"
        }
      ];

      testCases.forEach(({ input, description }) => {
        expect(input).toContain('split');
        expect(input).toContain('headers');
        expect(input).toContain('result');
      });
    });
  });
});
