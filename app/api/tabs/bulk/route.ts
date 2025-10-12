import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, data } = body;

    switch (operation) {
      case 'clear':
        await prisma.tab.deleteMany();
        return NextResponse.json({ 
          success: true, 
          message: 'All tabs cleared successfully' 
        });

      case 'export':
        const tabs = await prisma.tab.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        });
        return NextResponse.json({ 
          success: true, 
          data: {
            tabs,
            exportedAt: new Date().toISOString()
          }
        });

      case 'import':
        if (!data || !Array.isArray(data.tabs)) {
          return NextResponse.json(
            { success: false, error: 'Invalid import data format' },
            { status: 400 }
          );
        }

        await prisma.tab.deleteMany();

        const importedTabs = await prisma.tab.createMany({
          data: data.tabs.map((tab: { title: string; instructions: string; code: string }) => ({
            title: tab.title,
            instructions: tab.instructions,
            code: tab.code
          }))
        });

        return NextResponse.json({ 
          success: true, 
          data: {
            importedCount: importedTabs.count,
            message: `Successfully imported ${importedTabs.count} tabs`
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
