import { NextRequest, NextResponse } from 'next/server';
import { escapeRoomDatabaseService } from '@/service/escapeRoomDatabaseService';
import { prisma } from '@/lib/prisma';

// GET /api/escape-room/sessions - Get all game sessions
export async function GET() {
  try {
    const sessions = await prisma.gameSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 sessions
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to fetch game sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game sessions' },
      { status: 500 }
    );
  }
}

// POST /api/escape-room/sessions - Create new game session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName, timeLimit, timeLeft } = body;

    if (!timeLimit || !timeLeft) {
      return NextResponse.json(
        { error: 'timeLimit and timeLeft are required' },
        { status: 400 }
      );
    }

    const session = await escapeRoomDatabaseService.createGameSession({
      playerName,
      timeLimit,
      timeLeft,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Failed to create game session:', error);
    return NextResponse.json(
      { error: 'Failed to create game session' },
      { status: 500 }
    );
  }
}
