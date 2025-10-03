import { NextRequest, NextResponse } from 'next/server';
import { escapeRoomDatabaseService } from '@/service/escapeRoomDatabaseService';

// GET /api/escape-room/stages - Get all escape room stages
export async function GET() {
  try {
    const stages = await escapeRoomDatabaseService.getEscapeRoomStages();
    return NextResponse.json(stages);
  } catch (error) {
    console.error('Failed to fetch escape room stages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escape room stages' },
      { status: 500 }
    );
  }
}

// POST /api/escape-room/stages - Create new escape room stage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, starterCode, solution, hint, difficulty, points } = body;

    if (!title || !description || !starterCode || !solution || !hint) {
      return NextResponse.json(
        { error: 'title, description, starterCode, solution, and hint are required' },
        { status: 400 }
      );
    }

    const stage = await escapeRoomDatabaseService.createEscapeRoomStage({
      title,
      description,
      starterCode,
      solution,
      hint,
      difficulty,
      points,
    });

    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    console.error('Failed to create escape room stage:', error);
    return NextResponse.json(
      { error: 'Failed to create escape room stage' },
      { status: 500 }
    );
  }
}
