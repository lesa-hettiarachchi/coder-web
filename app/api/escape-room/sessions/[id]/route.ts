import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await prisma.gameSession.findUnique({
      where: { id },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching game session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game session' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { currentStage, timeLeft, stagesCompleted, userCode, isActive } = body;

    const session = await prisma.gameSession.update({
      where: { id },
      data: {
        currentStage: currentStage !== undefined ? parseInt(currentStage) : undefined,
        timeLeft: timeLeft !== undefined ? parseInt(timeLeft) : undefined,
        stagesCompleted: stagesCompleted !== undefined ? JSON.stringify(stagesCompleted) : undefined,
        userCode: userCode !== undefined ? userCode : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating game session:', error);
    return NextResponse.json(
      { error: 'Failed to update game session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.gameSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game session:', error);
    return NextResponse.json(
      { error: 'Failed to delete game session' },
      { status: 500 }
    );
  }
}
