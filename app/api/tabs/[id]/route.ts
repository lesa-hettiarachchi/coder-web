import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TabFormData } from '@/types/tabs';

// GET /api/tabs/[id] - Get a specific tab
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tab ID' },
        { status: 400 }
      );
    }

    const tab = await prisma.tab.findUnique({
      where: { id }
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
    console.error('Error fetching tab:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tab' },
      { status: 500 }
    );
  }
}

// PUT /api/tabs/[id] - Update a specific tab
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tab ID' },
        { status: 400 }
      );
    }

    const body: Partial<TabFormData> = await request.json();
    
    // Validate that at least one field is provided
    if (!body.title && !body.instructions && !body.code) {
      return NextResponse.json(
        { success: false, error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Check if tab exists
    const existingTab = await prisma.tab.findUnique({
      where: { id }
    });

    if (!existingTab) {
      return NextResponse.json(
        { success: false, error: 'Tab not found' },
        { status: 404 }
      );
    }

    const updatedTab = await prisma.tab.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.instructions && { instructions: body.instructions }),
        ...(body.code && { code: body.code })
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: updatedTab 
    });
  } catch (error) {
    console.error('Error updating tab:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tab' },
      { status: 500 }
    );
  }
}

// DELETE /api/tabs/[id] - Delete a specific tab
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tab ID' },
        { status: 400 }
      );
    }

    // Check if tab exists
    const existingTab = await prisma.tab.findUnique({
      where: { id }
    });

    if (!existingTab) {
      return NextResponse.json(
        { success: false, error: 'Tab not found' },
        { status: 404 }
      );
    }

    await prisma.tab.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Tab deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting tab:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tab' },
      { status: 500 }
    );
  }
}
