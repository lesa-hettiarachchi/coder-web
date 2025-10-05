import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create escape room stages
  const stages = [
    {
      title: 'Stage 1: Format the Code',
      description: 'Fix the indentation and formatting of this Python code:',
      difficulty: 'easy',
      timeLimit: 300,
      testCases: JSON.stringify([
        { input: '[1,2,3,4,5]', expected: '15' },
        { input: '[10,20,30]', expected: '60' }
      ]),
      expectedOutput: '15',
      hints: JSON.stringify([
        'Add proper indentation (4 spaces)',
        'Add spacing around operators'
      ]),
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

result = calculate_sum([1, 2, 3, 4, 5])
print(result)`,
      order: 1,
      isActive: true,
    },
    {
      title: 'Stage 2: Debug the Code',
      description: 'Find and fix the bug in this code:',
      difficulty: 'easy',
      timeLimit: 300,
      testCases: JSON.stringify([
        { input: '5', expected: '120' },
        { input: '3', expected: '6' }
      ]),
      expectedOutput: '120',
      hints: JSON.stringify([
        'Check the loop condition',
        'Look at the multiplication logic'
      ]),
      starterCode: `def factorial(n):
    # TODO: Fix this function
    result = 1
    for i in range(1, n):
        result *= i
    return result

print(factorial(5))`,
      solution: `def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(factorial(5))`,
      order: 2,
      isActive: true,
    },
    {
      title: 'Stage 3: Complete the Function',
      description: 'Complete the missing part of this function:',
      difficulty: 'medium',
      timeLimit: 600,
      testCases: JSON.stringify([
        { input: '["hello", "world"]', expected: '["HELLO", "WORLD"]' },
        { input: '["test", "case"]', expected: '["TEST", "CASE"]' }
      ]),
      expectedOutput: '["HELLO", "WORLD"]',
      hints: JSON.stringify([
        'Use the upper() method',
        'Apply it to each string in the list'
      ]),
      starterCode: `def capitalize_words(words):
    # TODO: Complete this function
    result = []
    for word in words:
        # Add code here to capitalize each word
        pass
    return result

words = ["hello", "world"]
print(capitalize_words(words))`,
      solution: `def capitalize_words(words):
    result = []
    for word in words:
        result.append(word.upper())
    return result

words = ["hello", "world"]
print(capitalize_words(words))`,
      order: 3,
      isActive: true,
    },
    {
      title: 'Stage 4: Data Conversion',
      description: 'Convert the data from one format to another:',
      difficulty: 'medium',
      timeLimit: 600,
      testCases: JSON.stringify([
        { input: '{"name": "John", "age": 30}', expected: '[("name", "John"), ("age", 30)]' },
        { input: '{"a": 1, "b": 2}', expected: '[("a", 1), ("b", 2)]' }
      ]),
      expectedOutput: '[("name", "John"), ("age", 30)]',
      hints: JSON.stringify([
        'Use dict.items() method',
        'Convert to list of tuples'
      ]),
      starterCode: `import json

def dict_to_tuples(json_str):
    data = json.loads(json_str)
    # TODO: Convert dictionary to list of tuples
    return []

data = '{"name": "John", "age": 30}'
print(dict_to_tuples(data))`,
      solution: `import json

def dict_to_tuples(json_str):
    data = json.loads(json_str)
    return list(data.items())

data = '{"name": "John", "age": 30}'
print(dict_to_tuples(data))`,
      order: 4,
      isActive: true,
    },
    {
      title: 'Stage 5: Binary Search',
      description: 'Implement binary search algorithm:',
      difficulty: 'hard',
      timeLimit: 900,
      testCases: JSON.stringify([
        { input: '[1,2,3,4,5], 3', expected: '2' },
        { input: '[1,2,3,4,5], 6', expected: '-1' }
      ]),
      expectedOutput: '2',
      hints: JSON.stringify([
        'Use two pointers: left and right',
        'Calculate middle index',
        'Compare target with middle element'
      ]),
      starterCode: `def binary_search(arr, target):
    # TODO: Implement binary search algorithm
    
        pass
    
    return -1

arr = [1, 2, 3, 4, 5]
target = 3
print(binary_search(arr, target))`,
      solution: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

arr = [1, 2, 3, 4, 5]
target = 3
print(binary_search(arr, target))`,
      order: 5,
      isActive: true,
    },
  ];

  // Clear existing data
  await prisma.stage.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.gameEvent.deleteMany();

  // Create new stages
  for (const stage of stages) {
    await prisma.stage.create({
      data: stage,
    });
  }

  console.log(`✅ Created ${stages.length} escape room stages`);

  // Create some sample leaderboard entries
  const leaderboardEntries = [
    {
      playerName: 'CodeMaster',
      finalScore: 950,
      timeCompleted: 1200,
      stagesCompleted: 5,
      gameMode: 'normal',
    },
    {
      playerName: 'PythonPro',
      finalScore: 850,
      timeCompleted: 1500,
      stagesCompleted: 5,
      gameMode: 'normal',
    },
    {
      playerName: 'TestPlayer',
      finalScore: 750,
      timeCompleted: 1800,
      stagesCompleted: 4,
      gameMode: 'normal',
    },
  ];

  // Create sample leaderboard entries
  for (const entry of leaderboardEntries) {
    await prisma.leaderboardEntry.create({
      data: entry,
    });
  }

  console.log(`Created ${leaderboardEntries.length} leaderboard entries`);
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });