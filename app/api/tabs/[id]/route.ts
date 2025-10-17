import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TabFormData } from '@/types/tabs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tab ID' },
        { status: 400 }
      );
    }

    const body: Partial<TabFormData> = await request.json();
    
    if (!body.title && !body.instructions && !body.body) {
      return NextResponse.json(
        { success: false, error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

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
        ...(body.body && { body: body.body })
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tab ID' },
        { status: 400 }
      );
    }

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
