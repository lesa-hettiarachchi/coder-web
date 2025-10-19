import { PrismaClient } from '@prisma/client';
import { escapeRoomQuestionBank } from './escapeRoomQuestions';

const prisma = new PrismaClient();

async function seedEscapeRoomQuestions() {
  try {
    console.log('Starting to seed escape room questions...');
    
    // Clear existing questions (fresh start)
    await prisma.escapeRoomStage.deleteMany({});
    console.log('Cleared existing questions');

    for (let i = 0; i < escapeRoomQuestionBank.length; i++) {
      const question = escapeRoomQuestionBank[i];
      await prisma.escapeRoomStage.create({
        data: {
          title: question.title,
          description: question.description,
          starterCode: question.starterCode,
          solution: question.solution,
          hint: question.hint,
          difficulty: question.difficulty,
          points: question.points,
          isActive: question.isActive,
        },
      });
      console.log(`Added question ${i + 1}: ${question.title}`);
    }
    
    console.log(`Successfully seeded ${escapeRoomQuestionBank.length} escape room questions!`);
    

    const count = await prisma.escapeRoomStage.count();
    console.log(`Total questions in database: ${count}`);
    
    const difficultyCounts = await prisma.escapeRoomStage.groupBy({
      by: ['difficulty'],
      _count: {
        difficulty: true,
      },
    });
    
    console.log('Questions by difficulty:');
    difficultyCounts.forEach((group: { difficulty: string; _count: { difficulty: number } }) => {
      console.log(`  ${group.difficulty}: ${group._count.difficulty} questions`);
    });
    
  } catch (error) {
    console.error('Error seeding escape room questions:', error);
    throw error;
  }
}

async function main() {
  console.log('Seeding database...');

  await seedEscapeRoomQuestions();

  const leaderboardEntries = [
    {
      playerName: 'CodeMaster',
      finalScore: 650,
      leaderboardScore: 650,
      timeCompleted: 1200,
      timeLimit: 1800,
      maxPossibleScore: 675,
      stagesCompleted: 5,
      gameMode: 'normal',
    },
    {
      playerName: 'PythonPro',
      finalScore: 575,
      leaderboardScore: 575,
      timeCompleted: 1500,
      timeLimit: 1800,
      maxPossibleScore: 675,
      stagesCompleted: 5,
      gameMode: 'normal',
    },
    {
      playerName: 'DebugKing',
      finalScore: 500,
      leaderboardScore: 500,
      timeCompleted: 1800,
      timeLimit: 1800,
      maxPossibleScore: 675,
      stagesCompleted: 4,
      gameMode: 'normal',
    }
  ];

  // Clear and recreate leaderboard entries
  await prisma.leaderboard.deleteMany({});

  for (const entry of leaderboardEntries) {
    await prisma.leaderboard.create({
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
