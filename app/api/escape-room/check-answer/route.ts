import { NextRequest, NextResponse } from 'next/server';
import { escapeRoomDatabaseService } from '@/service/escapeRoomDatabaseService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stageId, userCode, sessionId } = body;
    
    if (!stageId || !userCode) {
      return NextResponse.json(
        { error: 'Missing required fields: stageId and userCode' },
        { status: 400 }
      );
    }

    const stages = await escapeRoomDatabaseService.getEscapeRoomStages();
    const stage = stages.find(s => s.id === stageId);
    
    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }
    
    const normalizeCode = (code: string): string => {
      return code
        .trim()
        .replace(/\s+/g, ' ') 
        .replace(/[,\[\]]/g, ' ') 
        .replace(/\s*,\s*/g, ',') 
        .toLowerCase();
    };
    
    const userNormalized = normalizeCode(userCode);
    const solutionNormalized = normalizeCode(stage.solution);
    

    const isCorrect = 
      userNormalized.includes(solutionNormalized) || 
      solutionNormalized.includes(userNormalized) ||
      checkKeyComponents(stageId, userNormalized, solutionNormalized) ||
      checkFlexibleMatching(stageId, userNormalized, solutionNormalized);
    
    if (sessionId) {
      await escapeRoomDatabaseService.logGameEvent(sessionId, 'answer_attempt', {
        stageId,
        isCorrect,
        userCode: userCode.substring(0, 500) 
      });
    }
    
    return NextResponse.json({
      isCorrect,
      stageId,
      points: stage.points,
      difficulty: stage.difficulty,
      hint: stage.hint
    });
    
  } catch (error) {
    console.error('Error checking answer:', error);
    return NextResponse.json(
      { error: 'Failed to check answer' },
      { status: 500 }
    );
  }
}

function checkFlexibleMatching(stageId: number, userNormalized: string, _solutionNormalized: string): boolean {
  switch (stageId) {
    case 15:
      return (userNormalized.includes('split') && 
              userNormalized.includes('headers') && 
              userNormalized.includes('obj') && 
              userNormalized.includes('result')) ||
             (userNormalized.includes('csv') && 
              userNormalized.includes('json') && 
              userNormalized.includes('dict'));
    
    case 16:
      return (userNormalized.includes('bubble') || 
              userNormalized.includes('sort')) &&
             (userNormalized.includes('for i in range') || 
              userNormalized.includes('for j in range')) &&
             (userNormalized.includes('arr[j]') || 
              userNormalized.includes('arr[i]'));
    
    case 17: 
      return (userNormalized.includes('factorial') || 
              userNormalized.includes('recursive')) &&
             (userNormalized.includes('if n') || 
              userNormalized.includes('if n <= 1')) &&
             (userNormalized.includes('return n *') || 
              userNormalized.includes('return n*'));
    
    case 18:
      return (userNormalized.includes('binary') || 
              userNormalized.includes('search')) &&
             (userNormalized.includes('left') && 
              userNormalized.includes('right')) &&
             (userNormalized.includes('mid') || 
              userNormalized.includes('middle')) &&
             (userNormalized.includes('while') || 
              userNormalized.includes('for'));
    
    case 19:
      return (userNormalized.includes('re.findall') || 
              userNormalized.includes('re.search') ||
              userNormalized.includes('re.match')) &&
             (userNormalized.includes('@') && 
              userNormalized.includes('email')) ||
             (userNormalized.includes('pattern') && 
              userNormalized.includes('regex'));
    
    case 20: 
      return (userNormalized.includes('class') && 
              userNormalized.includes('bank') || 
              userNormalized.includes('account')) &&
             (userNormalized.includes('def __init__') || 
              userNormalized.includes('def __init')) &&
             (userNormalized.includes('self.balance') || 
              userNormalized.includes('balance')) &&
             (userNormalized.includes('deposit') && 
              userNormalized.includes('withdraw'));
    
    default:
      return false;
  }
}

function checkKeyComponents(stageId: number, userNormalized: string, _solutionNormalized: string): boolean {

  switch (stageId) {
    case 1:
      return userNormalized.includes('def calculate_sum') && 
             userNormalized.includes('for num in numbers') && 
             userNormalized.includes('sum += num');
    
    case 2: 
      return userNormalized.includes('for i in range') && 
             userNormalized.includes('print(i)');
    
    case 3: 
      return userNormalized.includes('def add_numbers') && 
             userNormalized.includes('return a + b');
    
    case 4:
      return userNormalized.includes('for i in range') && 
             userNormalized.includes('print("*" * i)');
    
    case 5:
      return userNormalized.includes('max(numbers)');
    
    case 6:
      return userNormalized.includes('count(\'a\')');
    
    case 7:
      return userNormalized.includes('[::-1]');
    
    case 8:
      return userNormalized.includes('max_val = arr[0]');
    
    case 9:
      return userNormalized.includes('a, b = 0, 1') && 
             userNormalized.includes('a, b = b, a + b');
    
    case 10:
      return userNormalized.includes('for i in range(2, int(n**0.5) + 1)') && 
             userNormalized.includes('if n % i == 0');
    
    case 11:
      return userNormalized.includes('[x**2 for x in numbers]');
    
    case 12:
      return userNormalized.includes('max(scores, key=scores.get)');
    
    case 13:
      return userNormalized.includes('title()');
    
    case 14:
      return userNormalized.includes('split(\'\\n\')') && 
             userNormalized.includes('len(lines)');
    
    case 15:
      return userNormalized.includes('split(\'\\n\')') && 
             userNormalized.includes('split(\',\')') && 
             userNormalized.includes('obj[headers[i]] = values[i]');
    
    case 16:
      return userNormalized.includes('for i in range(n)') && 
             userNormalized.includes('for j in range(0, n - i - 1)') && 
             userNormalized.includes('arr[j], arr[j + 1] = arr[j + 1], arr[j]');
    
    case 17:
      return userNormalized.includes('if n <= 1') && 
             userNormalized.includes('return n * factorial(n - 1)');
    
    case 18:
      return (userNormalized.includes('left') && userNormalized.includes('right')) && 
             (userNormalized.includes('mid') || userNormalized.includes('middle')) && 
             (userNormalized.includes('while') || userNormalized.includes('for'));
    
    case 19:
      return (userNormalized.includes('re.findall') || userNormalized.includes('re.search')) && 
             (userNormalized.includes('@') && userNormalized.includes('email')) ||
             userNormalized.includes('pattern');
    
    case 20:
      return userNormalized.includes('def __init__(self') && 
             userNormalized.includes('self.balance') && 
             userNormalized.includes('def deposit(self') && 
             userNormalized.includes('def withdraw(self');
    
    default:
      return false;
  }
}
