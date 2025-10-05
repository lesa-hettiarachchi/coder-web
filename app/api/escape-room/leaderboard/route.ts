import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName, finalScore, timeCompleted, stagesCompleted, gameMode = 'normal' } = body;

    if (!playerName || finalScore === undefined || timeCompleted === undefined || stagesCompleted === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: playerName, finalScore, timeCompleted, stagesCompleted' },
        { status: 400 }
      );
    }

    const entry = await prisma.leaderboardEntry.create({
      data: {
        playerName: playerName.trim(),
        finalScore: parseInt(finalScore),
        timeCompleted: parseInt(timeCompleted),
        stagesCompleted: parseInt(stagesCompleted),
        gameMode,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error adding leaderboard entry:', error);
    return NextResponse.json(
      { error: 'Failed to add leaderboard entry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const gameMode = searchParams.get('gameMode');

    let whereClause = {};
    if (gameMode) {
      whereClause = { gameMode };
    }

    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: whereClause,
      orderBy: [
        { finalScore: 'desc' },
        { timeCompleted: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit,
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
