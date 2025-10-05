import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName, customTime = 1800, gameMode = 'normal' } = body;

    if (!playerName || playerName.trim() === '') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const session = await prisma.gameSession.create({
      data: {
        playerName: playerName.trim(),
        customTime: parseInt(customTime),
        timeLeft: parseInt(customTime),
        gameMode,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating game session:', error);
    return NextResponse.json(
      { error: 'Failed to create game session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerName = searchParams.get('playerName');

    let whereClause = {};
    if (playerName) {
      whereClause = {
        playerName: {
          contains: playerName,
          mode: 'insensitive',
        },
      };
    }

    const sessions = await prisma.gameSession.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching game sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game sessions' },
      { status: 500 }
    );
  }
}
