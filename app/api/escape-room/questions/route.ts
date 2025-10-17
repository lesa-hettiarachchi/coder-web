import { NextRequest, NextResponse } from 'next/server';
import { escapeRoomDatabaseService } from '@/service/escapeRoomDatabaseService';
import { EscapeRoomStage } from '@/types/escapeRoom';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '4');
    const difficulty = searchParams.get('difficulty');
    
    const allStages = await escapeRoomDatabaseService.getEscapeRoomStages();
    
    let selectedStages: EscapeRoomStage[] = [];
    
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      const filteredStages = allStages.filter((stage: EscapeRoomStage) => stage.difficulty === difficulty);
      const shuffled = [...filteredStages].sort(() => Math.random() - 0.5);
      selectedStages = shuffled.slice(0, Math.min(count, filteredStages.length));
    } else {
      const easyStages = allStages.filter((stage: EscapeRoomStage) => stage.difficulty === 'easy');
      const mediumStages = allStages.filter((stage: EscapeRoomStage) => stage.difficulty === 'medium');
      const hardStages = allStages.filter((stage: EscapeRoomStage) => stage.difficulty === 'hard');
      
      const shuffledEasy = [...easyStages].sort(() => Math.random() - 0.5);
      const shuffledMedium = [...mediumStages].sort(() => Math.random() - 0.5);
      const shuffledHard = [...hardStages].sort(() => Math.random() - 0.5);
      
      selectedStages = [
        ...shuffledEasy.slice(0, 2),
        ...shuffledMedium.slice(0, 1),
        ...shuffledHard.slice(0, 1)
      ];
      
      if (selectedStages.length < 4) {
        const usedIds = new Set(selectedStages.map((s: EscapeRoomStage) => s.id));
        const remainingStages = allStages
          .filter((stage: EscapeRoomStage) => !usedIds.has(stage.id))
          .sort(() => Math.random() - 0.5);
        
        selectedStages.push(...remainingStages.slice(0, 4 - selectedStages.length));
      }
    }
    
    selectedStages.sort((a: EscapeRoomStage, b: EscapeRoomStage) => {
      const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
      return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
             difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
    });
    
    const baseMaxScore = selectedStages.reduce((total: number, stage: EscapeRoomStage) => total + stage.points, 0);
    const maxTimeBonus = 100; // Maximum time bonus points
    const maxPossibleScore = baseMaxScore + maxTimeBonus;
    
    return NextResponse.json({
      stages: selectedStages,
      total: selectedStages.length,
      difficulty: difficulty || 'balanced',
      maxPossibleScore: maxPossibleScore,
      distribution: {
        easy: selectedStages.filter((s: EscapeRoomStage) => s.difficulty === 'easy').length,
        medium: selectedStages.filter((s: EscapeRoomStage) => s.difficulty === 'medium').length,
        hard: selectedStages.filter((s: EscapeRoomStage) => s.difficulty === 'hard').length
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
