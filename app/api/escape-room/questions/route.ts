import { NextRequest, NextResponse } from 'next/server';
import { escapeRoomDatabaseService } from '@/service/escapeRoomDatabaseService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '4');
    const difficulty = searchParams.get('difficulty');
    
    const allStages = await escapeRoomDatabaseService.getEscapeRoomStages();
    
    let selectedStages = [];
    
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      const filteredStages = allStages.filter(stage => stage.difficulty === difficulty);
      const shuffled = [...filteredStages].sort(() => Math.random() - 0.5);
      selectedStages = shuffled.slice(0, Math.min(count, filteredStages.length));
    } else {
      const easyStages = allStages.filter(stage => stage.difficulty === 'easy');
      const mediumStages = allStages.filter(stage => stage.difficulty === 'medium');
      const hardStages = allStages.filter(stage => stage.difficulty === 'hard');
      
      const shuffledEasy = [...easyStages].sort(() => Math.random() - 0.5);
      const shuffledMedium = [...mediumStages].sort(() => Math.random() - 0.5);
      const shuffledHard = [...hardStages].sort(() => Math.random() - 0.5);
      
      selectedStages = [
        ...shuffledEasy.slice(0, 2),
        ...shuffledMedium.slice(0, 1),
        ...shuffledHard.slice(0, 1)
      ];
      
      if (selectedStages.length < 4) {
        const usedIds = new Set(selectedStages.map(s => s.id));
        const remainingStages = allStages
          .filter(stage => !usedIds.has(stage.id))
          .sort(() => Math.random() - 0.5);
        
        selectedStages.push(...remainingStages.slice(0, 4 - selectedStages.length));
      }
    }
    
    selectedStages.sort((a, b) => {
      const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
      return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
             difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
    });
    
    const maxScore = selectedStages.reduce((total, stage) => total + stage.points, 0);
    
    return NextResponse.json({
      stages: selectedStages,
      total: selectedStages.length,
      difficulty: difficulty || 'balanced',
      maxPossibleScore: maxScore,
      distribution: {
        easy: selectedStages.filter(s => s.difficulty === 'easy').length,
        medium: selectedStages.filter(s => s.difficulty === 'medium').length,
        hard: selectedStages.filter(s => s.difficulty === 'hard').length
      }
    });
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
