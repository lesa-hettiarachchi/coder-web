import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { eventType, eventData, data } = body;

    const gameEvent = await prisma.gameEvent.create({
      data: {
        sessionId: id,
        eventType,
        data: data || JSON.stringify(eventData || {}),
      },
    });

    return NextResponse.json(gameEvent);
  } catch (error) {
    console.error('Error creating game event:', error);
    return NextResponse.json(
      { error: 'Failed to create game event' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = await prisma.gameEvent.findMany({
      where: { sessionId: id },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching game events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game events' },
      { status: 500 }
    );
  }
}
