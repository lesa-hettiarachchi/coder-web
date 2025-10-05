import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive') !== 'false';

    let whereClause: any = {};
    if (difficulty) {
      whereClause.difficulty = difficulty;
    }
    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const stages = await prisma.stage.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(stages);
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, difficulty, timeLimit, testCases, expectedOutput, hints, solution, order } = body;

    if (!title || !description || !difficulty || !testCases || !expectedOutput || !solution || order === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const stage = await prisma.stage.create({
      data: {
        title,
        description,
        difficulty,
        timeLimit: parseInt(timeLimit) || 300,
        testCases: JSON.stringify(testCases),
        expectedOutput,
        hints: hints ? JSON.stringify(hints) : null,
        solution,
        order: parseInt(order),
      },
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error('Error creating stage:', error);
    return NextResponse.json(
      { error: 'Failed to create stage' },
      { status: 500 }
    );
  }
}
