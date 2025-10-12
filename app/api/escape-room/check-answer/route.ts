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
    
    // Get the stage from database
    const stages = await escapeRoomDatabaseService.getEscapeRoomStages();
    const stage = stages.find(s => s.id === stageId);
    
    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }
    
    // Normalize code for comparison
    const normalizeCode = (code: string): string => {
      return code
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/[,\[\]]/g, ' ') // Normalize array formatting
        .replace(/\s*,\s*/g, ',') // Normalize comma spacing
        .toLowerCase();
    };
    
    const userNormalized = normalizeCode(userCode);
    const solutionNormalized = normalizeCode(stage.solution);
    
    // Enhanced flexible checking logic with multiple matching strategies
    const isCorrect = 
      userNormalized.includes(solutionNormalized) || 
      solutionNormalized.includes(userNormalized) ||
      // Check for key components in the solution based on stage ID
      checkKeyComponents(stageId, userNormalized, solutionNormalized) ||
      // Additional flexible matching for hard questions
      checkFlexibleMatching(stageId, userNormalized, solutionNormalized);
    
    // Log the attempt
    if (sessionId) {
      await escapeRoomDatabaseService.logGameEvent(sessionId, 'answer_attempt', {
        stageId,
        isCorrect,
        userCode: userCode.substring(0, 500) // Limit stored code length
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

// Helper function for flexible matching of hard questions
function checkFlexibleMatching(stageId: number, userNormalized: string, solutionNormalized: string): boolean {
  switch (stageId) {
    case 15: // Data Conversion - CSV to JSON
      return (userNormalized.includes('split') && 
              userNormalized.includes('headers') && 
              userNormalized.includes('obj') && 
              userNormalized.includes('result')) ||
             (userNormalized.includes('csv') && 
              userNormalized.includes('json') && 
              userNormalized.includes('dict'));
    
    case 16: // Sorting Algorithm - Bubble Sort
      return (userNormalized.includes('bubble') || 
              userNormalized.includes('sort')) &&
             (userNormalized.includes('for i in range') || 
              userNormalized.includes('for j in range')) &&
             (userNormalized.includes('arr[j]') || 
              userNormalized.includes('arr[i]'));
    
    case 17: // Recursive Function - Factorial
      return (userNormalized.includes('factorial') || 
              userNormalized.includes('recursive')) &&
             (userNormalized.includes('if n') || 
              userNormalized.includes('if n <= 1')) &&
             (userNormalized.includes('return n *') || 
              userNormalized.includes('return n*'));
    
    case 18: // Binary Search
      return (userNormalized.includes('binary') || 
              userNormalized.includes('search')) &&
             (userNormalized.includes('left') && 
              userNormalized.includes('right')) &&
             (userNormalized.includes('mid') || 
              userNormalized.includes('middle')) &&
             (userNormalized.includes('while') || 
              userNormalized.includes('for'));
    
    case 19: // Regular Expression - Email extraction
      return (userNormalized.includes('re.findall') || 
              userNormalized.includes('re.search') ||
              userNormalized.includes('re.match')) &&
             (userNormalized.includes('@') && 
              userNormalized.includes('email')) ||
             (userNormalized.includes('pattern') && 
              userNormalized.includes('regex'));
    
    case 20: // Class Implementation - BankAccount
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

// Helper function to check key components for specific stages
function checkKeyComponents(stageId: number, userNormalized: string, solutionNormalized: string): boolean {
  // Stage-specific key component checks
  switch (stageId) {
    case 1: // Format the Code
      return userNormalized.includes('def calculate_sum') && 
             userNormalized.includes('for num in numbers') && 
             userNormalized.includes('sum += num');
    
    case 2: // Generate Numbers
      return userNormalized.includes('for i in range') && 
             userNormalized.includes('print(i)');
    
    case 3: // Simple Calculator
      return userNormalized.includes('def add_numbers') && 
             userNormalized.includes('return a + b');
    
    case 4: // Print Pattern
      return userNormalized.includes('for i in range') && 
             userNormalized.includes('print("*" * i)');
    
    case 5: // Find Maximum
      return userNormalized.includes('max(numbers)');
    
    case 6: // Count Characters
      return userNormalized.includes('count(\'a\')');
    
    case 7: // Reverse String
      return userNormalized.includes('[::-1]');
    
    case 8: // Debug the Code
      return userNormalized.includes('max_val = arr[0]');
    
    case 9: // Fibonacci Sequence
      return userNormalized.includes('a, b = 0, 1') && 
             userNormalized.includes('a, b = b, a + b');
    
    case 10: // Prime Number Check
      return userNormalized.includes('for i in range(2, int(n**0.5) + 1)') && 
             userNormalized.includes('if n % i == 0');
    
    case 11: // List Comprehension
      return userNormalized.includes('[x**2 for x in numbers]');
    
    case 12: // Dictionary Operations
      return userNormalized.includes('max(scores, key=scores.get)');
    
    case 13: // String Manipulation
      return userNormalized.includes('title()');
    
    case 14: // File Reading
      return userNormalized.includes('split(\'\\n\')') && 
             userNormalized.includes('len(lines)');
    
    case 15: // Data Conversion
      return userNormalized.includes('split(\'\\n\')') && 
             userNormalized.includes('split(\',\')') && 
             userNormalized.includes('obj[headers[i]] = values[i]');
    
    case 16: // Sorting Algorithm
      return userNormalized.includes('for i in range(n)') && 
             userNormalized.includes('for j in range(0, n - i - 1)') && 
             userNormalized.includes('arr[j], arr[j + 1] = arr[j + 1], arr[j]');
    
    case 17: // Recursive Function
      return userNormalized.includes('if n <= 1') && 
             userNormalized.includes('return n * factorial(n - 1)');
    
    case 18: // Binary Search
      return (userNormalized.includes('left') && userNormalized.includes('right')) && 
             (userNormalized.includes('mid') || userNormalized.includes('middle')) && 
             (userNormalized.includes('while') || userNormalized.includes('for'));
    
    case 19: // Regular Expression
      return (userNormalized.includes('re.findall') || userNormalized.includes('re.search')) && 
             (userNormalized.includes('@') && userNormalized.includes('email')) ||
             userNormalized.includes('pattern');
    
    case 20: // Class Implementation
      return userNormalized.includes('def __init__(self') && 
             userNormalized.includes('self.balance') && 
             userNormalized.includes('def deposit(self') && 
             userNormalized.includes('def withdraw(self');
    
    default:
      return false;
  }
}
