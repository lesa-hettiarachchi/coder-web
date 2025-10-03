import { NextRequest, NextResponse } from 'next/server';
import { escapeRoomDatabaseService } from '@/service/escapeRoomDatabaseService';

// GET /api/escape-room/sessions/[id] - Get specific game session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await escapeRoomDatabaseService.getGameSession(params.id);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Failed to fetch game session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game session' },
      { status: 500 }
    );
  }
}

// PUT /api/escape-room/sessions/[id] - Update game session
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const session = await escapeRoomDatabaseService.updateGameSession(params.id, body);
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Failed to update game session:', error);
    return NextResponse.json(
      { error: 'Failed to update game session' },
      { status: 500 }
    );
  }
}

// DELETE /api/escape-room/sessions/[id] - Delete game session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await escapeRoomDatabaseService.deleteGameSession(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete game session:', error);
    return NextResponse.json(
      { error: 'Failed to delete game session' },
      { status: 500 }
    );
  }
}
