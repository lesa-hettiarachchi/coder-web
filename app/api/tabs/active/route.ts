import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tabs/active - Get active tab ID (stored in cookies/localStorage on client)
export async function GET() {
  try {
    // Since active tab is managed on the client side via cookies,
    // this endpoint can be used for validation or fallback logic
    return NextResponse.json({ 
      success: true, 
      message: 'Active tab is managed on the client side' 
    });
  } catch (error) {
    console.error('Error in active tab endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process active tab request' },
      { status: 500 }
    );
  }
}

// POST /api/tabs/active - Validate active tab exists
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tabId } = body;

    if (!tabId) {
      return NextResponse.json(
        { success: false, error: 'Tab ID is required' },
        { status: 400 }
      );
    }

    const tab = await prisma.tab.findUnique({
      where: { id: parseInt(tabId) }
    });

    if (!tab) {
      return NextResponse.json(
        { success: false, error: 'Tab not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: tab 
    });
  } catch (error) {
    console.error('Error validating active tab:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate active tab' },
      { status: 500 }
    );
  }
}
