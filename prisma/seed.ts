import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create escape room stages
  const stages = [
    {
      id: 1,
      title: 'Stage 1: Format the Code',
      description: 'Fix the indentation and formatting of this Python code:',
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
      hint: 'Add proper indentation (4 spaces) and spacing around operators',
      difficulty: 'easy',
      points: 100,
      isActive: true,
    },
    {
      id: 2,
      title: 'Stage 2: Debug the Code',
      description: 'Find and fix the bug in this code:',
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
      hint: 'What if the array contains negative numbers? Initialize max_val with the first element.',
      difficulty: 'medium',
      points: 150,
      isActive: true,
    },
    {
      id: 3,
      title: 'Stage 3: Generate Numbers',
      description: 'Write code to generate all numbers from 0 to 1000:',
      starterCode: `# Write your code here to generate numbers 0 to 1000
`,
      solution: `for i in range(1001):
    print(i)`,
      hint: 'Use a for loop with range(). Remember range(1001) goes from 0 to 1000.',
      difficulty: 'easy',
      points: 100,
      isActive: true,
    },
    {
      id: 4,
      title: 'Stage 4: Data Conversion',
      description: 'Convert this CSV data to JSON format:',
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

lines = csv_data.strip().split('\\n')
headers = lines[0].split(',')
result = []

for line in lines[1:]:
    values = line.split(',')
    obj = {}
    for i in range(len(headers)):
        obj[headers[i]] = values[i]
    result.append(obj)

print(result)`,
      hint: 'Split by newlines, extract headers, then create dictionaries for each row.',
      difficulty: 'hard',
      points: 200,
      isActive: true,
    },
    {
      id: 5,
      title: 'Stage 5: Algorithm Implementation',
      description: 'Implement a binary search algorithm:',
      starterCode: `# Implement binary search
def binary_search(arr, target):
    # Your code here
    pass

# Test your implementation
arr = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search(arr, 7))  # Should return 3
print(binary_search(arr, 4))  # Should return -1`,
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

# Test your implementation
arr = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search(arr, 7))  # Should return 3
print(binary_search(arr, 4))  # Should return -1`,
      hint: 'Use two pointers (left and right) and compare the middle element with the target.',
      difficulty: 'hard',
      points: 250,
      isActive: true,
    },
  ];

  // Clear existing stages
  await prisma.escapeRoomStage.deleteMany({});

  // Create new stages
  for (const stage of stages) {
    await prisma.escapeRoomStage.create({
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
      playerName: 'DebugKing',
      finalScore: 750,
      timeCompleted: 1800,
      stagesCompleted: 4,
      gameMode: 'normal',
    },
    {
      playerName: 'SpeedCoder',
      finalScore: 800,
      timeCompleted: 900,
      stagesCompleted: 4,
      gameMode: 'speed',
    },
  ];

  // Clear existing leaderboard
  await prisma.leaderboard.deleteMany({});

  // Create leaderboard entries
  for (const entry of leaderboardEntries) {
    await prisma.leaderboard.create({
      data: entry,
    });
  }

  console.log(`✅ Created ${leaderboardEntries.length} leaderboard entries`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
