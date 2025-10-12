import { NextRequest, NextResponse } from 'next/server';
import { escapeRoomDatabaseService } from '@/service/escapeRoomDatabaseService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const leaderboard = await escapeRoomDatabaseService.getLeaderboard(limit);
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      playerName, 
      finalScore, 
      leaderboardScore, 
      timeCompleted, 
      timeLimit, 
      maxPossibleScore, 
      stagesCompleted, 
      gameMode 
    } = body;
    
    if (!playerName || finalScore === undefined || timeCompleted === undefined || stagesCompleted === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const entry = await escapeRoomDatabaseService.addToLeaderboard({
      playerName,
      finalScore,
      leaderboardScore: leaderboardScore || 0,
      timeCompleted,
      timeLimit: timeLimit || 1800,
      maxPossibleScore: maxPossibleScore || 675,
      stagesCompleted,
      gameMode: gameMode || 'normal'
    });
    
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error adding to leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to add to leaderboard' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await escapeRoomDatabaseService.clearLeaderboard();
    return NextResponse.json({ message: 'Leaderboard cleared successfully' });
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to clear leaderboard' },
      { status: 500 }
    );
  }
}

