import { EscapeRoomGameData, EscapeRoomStage } from '@/types/escapeRoom';

const STORAGE_KEY = 'escapeRoomData';
const STAGES_KEY = 'escapeRoomStages';

export const escapeRoomStages: EscapeRoomStage[] = [
  {
    id: 1,
    title: "Stage 1: Format the Code",
    description: "Fix the indentation and formatting of this Python code:",
    starterCode: `def calculate_sum(numbers):
sum = 0
for num in numbers:
sum += num
return sum
result = calculate_sum([1,2,3,4,5])
print(result)`,
    solution: `def calculate_sum(numbers):
    sum = 0
    for num in numbers:
        sum += num
    return sum

result = calculate_sum([1,2,3,4,5])
print(result)`,
    hint: "Add proper indentation (4 spaces) and spacing around operators",
    difficulty: "easy",
    points: 125,
    isActive: true
  },
  {
    id: 2,
    title: "Stage 2: Debug the Code",
    description: "Find and fix the bug in this code:",
    starterCode: `def find_maximum(arr):
    max_val = 0
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val

print(find_maximum([5, 3, 9, 1, 7]))`,
    solution: `def find_maximum(arr):
    max_val = arr[0]
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val

print(find_maximum([5, 3, 9, 1, 7]))`,
    hint: "What if the array contains negative numbers? Initialize max_val with the first element.",
    difficulty: "medium",
    points: 175,
    isActive: true
  },
  {
    id: 3,
    title: "Stage 3: Generate Numbers",
    description: "Write code to generate all numbers from 0 to 1000:",
    starterCode: `# Write your code here to generate numbers 0 to 1000
`,
    solution: `for i in range(1001):
    print(i)`,
    hint: "Use a for loop with range(). Remember range(1001) goes from 0 to 1000.",
    difficulty: "easy",
    points: 125,
    isActive: true
  },
  {
    id: 4,
    title: "Stage 4: Data Conversion",
    description: "Convert this CSV data to JSON format:",
    starterCode: `# Convert CSV to JSON
csv_data = """name,age,city
Alice,30,New York
Bob,25,London
Charlie,35,Tokyo"""

# Write your conversion code here
`,
    solution: `csv_data = """name,age,city
Alice,30,New York
Bob,25,London
Charlie,35,Tokyo"""

lines = csv_data.strip().split('\n')
headers = lines[0].split(',')
result = []

for line in lines[1:]:
    values = line.split(',')
    obj = {}
    for i in range(len(headers)):
        obj[headers[i]] = values[i]
    result.append(obj)

print(result)`,
    hint: "Split by newlines, extract headers, then create dictionaries for each row.",
    difficulty: "hard",
    points: 225,
    isActive: true
  }
];

export const escapeRoomService = {
  getStages(): EscapeRoomStage[] {
    try {
      const stored = localStorage.getItem(STAGES_KEY);
      return stored ? JSON.parse(stored) : escapeRoomStages;
    } catch (error) {
      console.error('Failed to load escape room stages:', error);
      return escapeRoomStages;
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

  createNewGame(): EscapeRoomGameData {
    const newGame: EscapeRoomGameData = {
      id: Date.now().toString(),
      startTime: new Date(),
      completedStages: [],
      won: false,
      stages: this.getStages()
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
