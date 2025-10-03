import { NextRequest, NextResponse } from 'next/server';
import { escapeRoomDatabaseService } from '@/service/escapeRoomDatabaseService';

// GET /api/escape-room/leaderboard - Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const leaderboard = await escapeRoomDatabaseService.getLeaderboard(limit);
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

// POST /api/escape-room/leaderboard - Add to leaderboard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName, finalScore, timeCompleted, stagesCompleted, gameMode } = body;

    if (!playerName || !finalScore || !timeCompleted || !stagesCompleted) {
      return NextResponse.json(
        { error: 'playerName, finalScore, timeCompleted, and stagesCompleted are required' },
        { status: 400 }
      );
    }

    const entry = await escapeRoomDatabaseService.addToLeaderboard({
      playerName,
      finalScore,
      timeCompleted,
      stagesCompleted,
      gameMode,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Failed to add to leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to add to leaderboard' },
      { status: 500 }
    );
  }
}
