import { PrismaClient } from '@prisma/client';
import { escapeRoomQuestionBank } from '../data/escapeRoomQuestions';

const prisma = new PrismaClient();

async function seedEscapeRoomQuestions() {
  try {
    console.log('🌱 Starting to seed escape room questions...');
    
    // Clear existing questions
    await prisma.escapeRoomStage.deleteMany({});
    console.log('🗑️  Cleared existing questions');
    
    // Insert new questions
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
      console.log(`✅ Added question ${i + 1}: ${question.title}`);
    }
    
    console.log(`🎉 Successfully seeded ${escapeRoomQuestionBank.length} escape room questions!`);
    
    // Verify the data
    const count = await prisma.escapeRoomStage.count();
    console.log(`📊 Total questions in database: ${count}`);
    
    const difficultyCounts = await prisma.escapeRoomStage.groupBy({
      by: ['difficulty'],
      _count: {
        difficulty: true,
      },
    });
    
    console.log('📈 Questions by difficulty:');
    difficultyCounts.forEach(group => {
      console.log(`  ${group.difficulty}: ${group._count.difficulty} questions`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding escape room questions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedEscapeRoomQuestions()
    .then(() => {
      console.log('✨ Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedEscapeRoomQuestions };
