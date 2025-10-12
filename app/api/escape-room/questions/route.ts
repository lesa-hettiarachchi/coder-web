import { NextRequest, NextResponse } from 'next/server';
import { escapeRoomDatabaseService } from '@/service/escapeRoomDatabaseService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '4');
    const difficulty = searchParams.get('difficulty'); // 'easy', 'medium', 'hard', or null for random
    
    // Get all active stages from database
    const allStages = await escapeRoomDatabaseService.getEscapeRoomStages();
    
    let filteredStages = allStages;
    
    // Filter by difficulty if specified
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      filteredStages = allStages.filter(stage => stage.difficulty === difficulty);
    }
    
    // Shuffle and select random stages
    const shuffled = [...filteredStages].sort(() => Math.random() - 0.5);
    const selectedStages = shuffled.slice(0, Math.min(count, filteredStages.length));
    
    // If we don't have enough stages, fill with random stages from all difficulties
    if (selectedStages.length < count) {
      const remaining = count - selectedStages.length;
      const usedIds = new Set(selectedStages.map(s => s.id));
      const additionalStages = allStages
        .filter(stage => !usedIds.has(stage.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, remaining);
      
      selectedStages.push(...additionalStages);
    }
    
    // Sort by difficulty for better game flow (easy -> medium -> hard)
    selectedStages.sort((a, b) => {
      const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
      return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
             difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
    });
    
    return NextResponse.json({
      stages: selectedStages,
      total: selectedStages.length,
      difficulty: difficulty || 'mixed'
    });
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
