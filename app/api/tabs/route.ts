import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TabFormData } from '@/types/tabs';

export async function GET() {
  try {
    const tabs = await prisma.tab.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: tabs 
    });
  } catch (error) {
    console.error('Error fetching tabs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tabs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TabFormData = await request.json();
    
    if (!body.title || !body.instructions || !body.code) {
      return NextResponse.json(
        { success: false, error: 'Title, instructions, and code are required' },
        { status: 400 }
      );
    }

    const tabCount = await prisma.tab.count();
    if (tabCount >= 20) {
      return NextResponse.json(
        { success: false, error: 'Maximum number of tabs (20) reached' },
        { status: 400 }
      );
    }

    const newTab = await prisma.tab.create({
      data: {
        title: body.title,
        instructions: body.instructions,
        code: body.code
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: newTab 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating tab:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tab' },
      { status: 500 }
    );
  }
}
