import { NextRequest, NextResponse } from 'next/server';
import { escapeRoomDatabaseService } from '@/service/escapeRoomDatabaseService';
import { escapeRoomLinter } from '@/lib/escapeRoomLinter';

export async function POST(request: NextRequest) {
  try {
    const { stageId, userCode, sessionId } = await request.json();
    
    if (!stageId || !userCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stages = await escapeRoomDatabaseService.getEscapeRoomStages();
    const stage = stages.find((s: { id: number }) => s.id === stageId);
    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    const result = await escapeRoomLinter.validateStage(stageId, userCode, stage.points);
    

    if (sessionId) {
      try {
        await escapeRoomDatabaseService.logGameEvent(sessionId, 'linting_attempt', {
          stageId,
          isCorrect: result.isValid,
          userCode: userCode.substring(0, 500),
          lintingDetails: {
            errors: result.errors,
            warnings: result.warnings,
            score: result.score,
            maxScore: stage.points
          }
        });
      } catch (error) {
        console.warn('Failed to log linting event:', error);
      }
    }

    return NextResponse.json({
      isCorrect: result.isValid,
      stageId,
      points: result.score,
      difficulty: stage.difficulty,
      hint: stage.hint,
      feedback: result.feedback,
      lintingDetails: {
        errors: result.errors,
        warnings: result.warnings,
        score: result.score,
        maxScore: stage.points
      },
      method: 'linting'
    });
    
  } catch (error) {
    console.error('Error checking answer:', error);
    return NextResponse.json({ error: 'Failed to check answer' }, { status: 500 });
  }
}
