import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface LintingResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
  feedback: string;
  output?: string;
  executionError?: string;
}

export interface CodeValidationOptions {
  checkSyntax: boolean;
  checkStyle: boolean;
  checkLogic: boolean;
  executeCode?: boolean;
  expectedOutput?: string;
  requiredPatterns?: string[];
  forbiddenPatterns?: string[];
}

export class EscapeRoomLinter {
  private pythonAvailable: boolean | null = null;

  private async checkPythonAvailability(): Promise<boolean> {
    if (this.pythonAvailable !== null) {
      return this.pythonAvailable;
    }

    try {
      await execAsync('python3 --version');
      this.pythonAvailable = true;
      return true;
    } catch {
      this.pythonAvailable = false;
      return false;
    }
  }

  private async executePythonCode(code: string, testCode?: string): Promise<{ output: string; error: string; success: boolean }> {
    try {
      const tempFile = path.join(os.tmpdir(), `execute_${Date.now()}.py`);
      const fullCode = testCode ? `${code}\n\n${testCode}` : code;
      fs.writeFileSync(tempFile, fullCode);
      
      const { stdout, stderr } = await execAsync(`python3 "${tempFile}"`, {
        timeout: 5000, // 5 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      // Clean up
      fs.unlinkSync(tempFile);
      
      return {
        output: stdout.trim(),
        error: stderr.trim(),
        success: true
      };
    } catch (error: unknown) {
      // Clean up temp file if it exists
      try {
        const tempFile = path.join(os.tmpdir(), `execute_${Date.now()}.py`);
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch {}
      
      const errorMessage = error instanceof Error ? error.message : 'Execution failed';
      
      return {
        output: '',
        error: errorMessage,
        success: false
      };
    }
  }

  private getTestCodeForStage(options: CodeValidationOptions, userCode: string): string {
    // Check if user's code already contains print statements
    const hasPrintStatements = userCode.includes('print(');
    
    // For most challenges, the user's code already contains the complete solution
    // Only add test code for function definitions that need to be called AND don't have print statements
    if (options.requiredPatterns?.includes('def calculate_sum') && !hasPrintStatements) {
      return 'print(calculate_sum([1, 2, 3, 4, 5]))';
    }
    if (options.requiredPatterns?.includes('def add_numbers') && !hasPrintStatements) {
      return 'print(add_numbers(3, 5))';
    }
    if (options.requiredPatterns?.includes('if n <= 1') && options.requiredPatterns?.includes('return n * factorial(n - 1)') && !hasPrintStatements) {
      return 'print(factorial(5))';
    }
    
    // For all other challenges, the user's code already contains the complete solution
    // No need to add additional test code
    return '';
  }

  private async runPyflakes(code: string): Promise<{ errors: string[]; warnings: string[] }> {
    const isPythonAvailable = await this.checkPythonAvailability();
    
    if (!isPythonAvailable) {
      // Use basic syntax checking without logging warning every time
      return this.basicSyntaxCheck(code);
    }
    // First check if code is empty or only comments
    const nonCommentLines = code.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('"""') && !trimmed.startsWith("'''");
    });
    
    if (nonCommentLines.length === 0) {
      return { 
        errors: ['Code cannot be empty or contain only comments. Please write actual Python code.'], 
        warnings: [] 
      };
    }
    
    // Check if there's any actual executable code
    const hasExecutableCode = nonCommentLines.some(line => {
      const trimmed = line.trim();
      return /^\s*(def|class|if|for|while|try|except|finally|with|print|return|yield|break|continue|pass|raise|assert|del|global|nonlocal)\b/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\[/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[+\-*/%=<>!&|]/.test(trimmed);
    });
    
    if (!hasExecutableCode) {
      return { 
        errors: ['Code must contain executable Python statements. Please write actual code that performs operations.'], 
        warnings: [] 
      };
    }

    try {
      // Create a temporary file to check
      const tempFile = path.join(os.tmpdir(), `temp_${Date.now()}.py`);
      fs.writeFileSync(tempFile, code);
      
      const { stderr } = await execAsync(`python3 -m pyflakes "${tempFile}"`);
      
      // Clean up
      fs.unlinkSync(tempFile);
      
      const errors: string[] = [];
      const warnings: string[] = [];
      
      if (stderr) {
        const lines = stderr.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          if (line.includes('error') || line.includes('Error')) {
            errors.push(line);
          } else {
            warnings.push(line);
          }
        });
      }
      
      return { errors, warnings };
    } catch {
      // If pyflakes fails, fall back to basic syntax checking
      return this.basicSyntaxCheck(code);
    }
  }

  private async runPylint(code: string): Promise<{ errors: string[]; warnings: string[] }> {
    const isPythonAvailable = await this.checkPythonAvailability();
    
    if (!isPythonAvailable) {
      // Use basic style checking without logging warning every time
      return this.basicStyleCheck(code);
    }
    // First check if code is empty or only comments
    const nonCommentLines = code.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('"""') && !trimmed.startsWith("'''");
    });
    
    if (nonCommentLines.length === 0) {
      return { 
        errors: ['Code cannot be empty or contain only comments. Please write actual Python code.'], 
        warnings: [] 
      };
    }
    
    // Check if there's any actual executable code
    const hasExecutableCode = nonCommentLines.some(line => {
      const trimmed = line.trim();
      return /^\s*(def|class|if|for|while|try|except|finally|with|print|return|yield|break|continue|pass|raise|assert|del|global|nonlocal)\b/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\[/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[+\-*/%=<>!&|]/.test(trimmed);
    });
    
    if (!hasExecutableCode) {
      return { 
        errors: ['Code must contain executable Python statements. Please write actual code that performs operations.'], 
        warnings: [] 
      };
    }

    try {
      const tempFile = path.join(os.tmpdir(), `temp_${Date.now()}.py`);
      fs.writeFileSync(tempFile, code);
      
      const { stdout, stderr } = await execAsync(`python3 -m pylint --disable=all --enable=unused-variable,undefined-variable,unused-import "${tempFile}"`);
      
      // Clean up
      fs.unlinkSync(tempFile);
      
      const errors: string[] = [];
      const warnings: string[] = [];
      
      const output = stdout + stderr;
      const lines = output.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        if (line.includes('error') || line.includes('Error') || line.includes('E:')) {
          errors.push(line);
        } else if (line.includes('warning') || line.includes('W:')) {
          warnings.push(line);
        }
      });
      
      return { errors, warnings };
    } catch {
      // If pylint fails, fall back to basic style checking
      return this.basicStyleCheck(code);
    }
  }

  private checkRequiredPatterns(code: string, patterns: string[]): string[] {
    const missing: string[] = [];
    
    patterns.forEach(pattern => {
      const found = this.checkPatternFlexibly(code, pattern);
      if (!found) {
        missing.push(`❌ Missing required code: ${pattern}`);
      }
    });
    
    return missing;
  }

  private checkPatternFlexibly(code: string, pattern: string): boolean {
    // Normalize code for comparison
    const normalizedCode = code.toLowerCase().replace(/\s+/g, ' ');
    
    // Handle different pattern types with stricter checking
    if (pattern.includes('def ')) {
      // Function definition - check for function name and structure
      const funcName = pattern.replace('def ', '').split('(')[0].trim();
      const hasFunction = normalizedCode.includes(`def ${funcName.toLowerCase()}`);
      
      // Also check that it's not just a comment
      const lines = code.split('\n');
      const hasRealFunction = lines.some(line => {
        const trimmed = line.trim();
        return trimmed.startsWith('def ') && trimmed.includes(funcName) && !trimmed.startsWith('#');
      });
      
      return hasFunction && hasRealFunction;
    }
    
    if (pattern.includes('for ') && pattern.includes(' in ')) {
      // Loop pattern - be flexible with variable names
      if (pattern.includes('for num in numbers')) {
        return normalizedCode.includes('for ') && 
               normalizedCode.includes(' in ') && 
               normalizedCode.includes('numbers');
      }
      if (pattern.includes('for i in range')) {
        return normalizedCode.includes('for ') && 
               normalizedCode.includes(' in ') && 
               normalizedCode.includes('range');
      }
    }
    
    // Handle simple patterns like 'for ', 'if ', 'return ', '**', 'key=', 'get', 're.'
    if (pattern === 'for ' || pattern === 'if ' || pattern === 'return ' || 
        pattern === '**' || pattern === 'key=' || pattern === 'get' || pattern === 're.') {
      return normalizedCode.includes(pattern);
    }
    
    // Handle bracket patterns like '[' and 'obj['
    if (pattern === '[' || pattern === 'obj[') {
      return normalizedCode.includes(pattern);
    }
    
    // Handle array access patterns like 'arr[j]' and 'arr[j + 1]'
    if (pattern === 'arr[j]' || pattern === 'arr[j + 1]') {
      return normalizedCode.includes('arr[') && normalizedCode.includes('j');
    }
    
    // Handle nested loop patterns like 'for j in range'
    if (pattern === 'for j in range') {
      return normalizedCode.includes('for ') && normalizedCode.includes('j') && normalizedCode.includes('range');
    }
    
    // Check for common mistakes like "for i range" instead of "for i in range"
    if (pattern.includes('for i in range') && normalizedCode.includes('for ') && normalizedCode.includes('range')) {
      // Check if it's missing "in" - common mistake
      if (normalizedCode.includes('for ') && normalizedCode.includes('range') && !normalizedCode.includes(' in ')) {
        return false; // This is a syntax error - missing "in"
      }
      return normalizedCode.includes('for ') && 
             normalizedCode.includes(' in ') && 
             normalizedCode.includes('range');
    }
    
    if (pattern.includes('+=')) {
      // Accumulation pattern - be flexible with variable names
      return normalizedCode.includes('+=') || 
             (normalizedCode.includes(' = ') && normalizedCode.includes(' + '));
    }
    
    if (pattern.includes('return ')) {
      // Return statement - be flexible with variable names
      return normalizedCode.includes('return ');
    }
    
    if (pattern.includes('print(')) {
      // Print statement - be flexible with variable names
      return normalizedCode.includes('print(');
    }
    
    if (pattern.includes('max(')) {
      // Max function - be flexible with variable names
      return normalizedCode.includes('max(');
    }
    
    if (pattern.includes('count(')) {
      // Count function - be flexible with quotes
      return normalizedCode.includes('count(');
    }
    
    if (pattern.includes('[::-1]')) {
      // String slicing
      return normalizedCode.includes('[::-1]');
    }
    
    if (pattern.includes('title()')) {
      // String method
      return normalizedCode.includes('title()');
    }
    
    if (pattern.includes('split(')) {
      // Split method - be flexible with quotes
      return normalizedCode.includes('split(');
    }
    
    if (pattern.includes('len(')) {
      // Length function
      return normalizedCode.includes('len(');
    }
    
    if (pattern.includes('if ') && pattern.includes(' <= ')) {
      // Conditional with comparison
      return normalizedCode.includes('if ') && normalizedCode.includes(' <= ');
    }
    
    if (pattern.includes('while ')) {
      // While loop
      return normalizedCode.includes('while ');
    }
    
    if (pattern.includes('class ')) {
      // Class definition
      return normalizedCode.includes('class ');
    }
    
    if (pattern.includes('self.')) {
      // Instance variable
      return normalizedCode.includes('self.');
    }
    
    if (pattern.includes('import ')) {
      // Import statement
      return normalizedCode.includes('import ');
    }
    
    if (pattern.includes('@')) {
      // Email pattern
      return normalizedCode.includes('@');
    }
    
 
    if (pattern.includes('obj[headers[i]] = values[i]')) {
      return normalizedCode.includes('obj[') && 
             normalizedCode.includes('headers[') && 
             normalizedCode.includes('values[');
    }
    
    if (pattern.includes('arr[j], arr[j + 1] = arr[j + 1], arr[j]')) {
      return normalizedCode.includes('arr[') && 
             normalizedCode.includes('arr[j + 1]') &&
             normalizedCode.includes('arr[j]');
    }
    
    if (pattern.includes('a, b = 0, 1')) {
      return normalizedCode.includes('a, b = 0, 1') || 
             normalizedCode.includes('a,b=0,1');
    }
    
    if (pattern.includes('a, b = b, a + b')) {
      return normalizedCode.includes('a, b = b, a + b') || 
             normalizedCode.includes('a,b=b,a+b');
    }
    
    
    if (pattern.includes('for i in range(2, int(n**0.5) + 1)')) {
      
      return normalizedCode.includes('for ') && 
             normalizedCode.includes(' in ') && 
             normalizedCode.includes('range(2, int(n**0.5) + 1)');
    }
    
    if (pattern === 'arr[0]') {
      return normalizedCode.includes('arr[0]');
    }
    
    if (pattern === 'int(n**0.5)') {
      return normalizedCode.includes('int(') && normalizedCode.includes('**0.5');
    }
    
    if (pattern.includes('if n % i == 0')) {
      
      return normalizedCode.includes('if ') && 
             normalizedCode.includes(' % ') && 
             normalizedCode.includes(' == 0');
    }
    
    if (pattern.includes('[x**2 for x in numbers]')) {
      
      return normalizedCode.includes('[') && 
             normalizedCode.includes('**2') && 
             normalizedCode.includes(' for ') &&
             normalizedCode.includes(' in ');
    }
    
    if (pattern.includes('max(scores, key=scores.get)')) {
     
      return normalizedCode.includes('max(') && 
             normalizedCode.includes('key=') && 
             normalizedCode.includes('.get');
    }
    
    if (pattern.includes('split("\\n")') || pattern.includes("split('\\n')")) {
      return normalizedCode.includes('split(') && 
             (normalizedCode.includes('"\\n"') || normalizedCode.includes("'\\n'") || 
              normalizedCode.includes('split("\\n")') || normalizedCode.includes("split('\\n')"));
    }
    
    if (pattern.includes("split(',')") || pattern.includes('split(",")')) {
      
      return normalizedCode.includes('split(') && 
             (normalizedCode.includes("','") || normalizedCode.includes('","'));
    }
    
    if (pattern.includes('for i in range(n)')) {
      
      return normalizedCode.includes('for ') && 
             normalizedCode.includes(' in ') && 
             normalizedCode.includes('range(n)');
    }
    
    if (pattern.includes('for j in range(0, n - i - 1)')) {
      
      return normalizedCode.includes('for ') && 
             normalizedCode.includes(' in ') && 
             normalizedCode.includes('range(0, n - i - 1)');
    }
    
    if (pattern.includes('arr[j], arr[j + 1] = arr[j + 1], arr[j]')) {
      
      return normalizedCode.includes('arr[') && 
             normalizedCode.includes('arr[j + 1]') &&
             normalizedCode.includes('arr[j]');
    }
    
    if (pattern.includes('if n <= 1')) {
      
      return normalizedCode.includes('if ') && 
             normalizedCode.includes(' <= 1');
    }
    
    if (pattern.includes('return n * factorial(n - 1)')) {
      
      return normalizedCode.includes('return ') && 
             normalizedCode.includes(' * ') && 
             normalizedCode.includes('factorial(');
    }
    
    if (pattern.includes('left') && pattern.includes('right') && pattern.includes('mid') && pattern.includes('while')) {
      
      return normalizedCode.includes('left') && 
             normalizedCode.includes('right') && 
             normalizedCode.includes('mid') && 
             normalizedCode.includes('while');
    }
    
    if (pattern.includes('re.findall') || pattern.includes('re.search')) {
      
      return normalizedCode.includes('re.') && 
             (normalizedCode.includes('findall') || normalizedCode.includes('search'));
    }
    
    if (pattern.includes('def __init__(self')) {
     
      return normalizedCode.includes('def __init__(self');
    }
    
    if (pattern.includes('self.balance')) {
     
      return normalizedCode.includes('self.balance');
    }
    
    if (pattern.includes('def deposit(self') || pattern.includes('def withdraw(self')) {
      
      return normalizedCode.includes('def ') && 
             normalizedCode.includes('self') && 
             (normalizedCode.includes('deposit') || normalizedCode.includes('withdraw'));
    }
    
    
    const simplePatterns = ['left', 'right', 'mid', 'while', 'email', '@'];
    if (simplePatterns.some(simple => pattern === simple)) {
      return normalizedCode.includes(pattern.toLowerCase());
    }
    
    
    return false;
  }

  private checkForbiddenPatterns(code: string, patterns: string[]): string[] {
    const violations: string[] = [];
    
    patterns.forEach(pattern => {
      if (code.includes(pattern)) {
        violations.push(`Forbidden pattern found: ${pattern}`);
      }
    });
    
    return violations;
  }

  private basicSyntaxCheck(code: string): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if code is empty or only contains comments/whitespace
    const nonCommentLines = code.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('"""') && !trimmed.startsWith("'''");
    });
    
    if (nonCommentLines.length === 0) {
      errors.push('Code cannot be empty or contain only comments. Please write actual Python code.');
      return { errors, warnings };
    }
    
    // Check if there's any actual executable code (not just variable assignments or imports)
    const hasExecutableCode = nonCommentLines.some(line => {
      const trimmed = line.trim();
      // Look for function definitions, loops, conditionals, print statements, return statements, etc.
      return /^\s*(def|class|if|for|while|try|except|finally|with|print|return|yield|break|continue|pass|raise|assert|del|global|nonlocal)\b/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(trimmed) || // Function calls
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\[/.test(trimmed) || // List/dict access
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[+\-*/%=<>!&|]/.test(trimmed); // Operations
    });
    
    if (!hasExecutableCode) {
      errors.push('Code must contain executable Python statements. Please write actual code that performs operations.');
      return { errors, warnings };
    }
    
    // Basic syntax checks
    const lines = code.split('\n');
    
    // Check for common syntax errors
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for unmatched parentheses
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push(`Unmatched parentheses on line ${i + 1}`);
      }
      
      // Check for unmatched quotes (but skip triple quotes)
      if (!line.includes('"""') && !line.includes("'''")) {
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        if (singleQuotes % 2 !== 0) {
          errors.push(`Unmatched single quotes on line ${i + 1}`);
        }
        if (doubleQuotes % 2 !== 0) {
          errors.push(`Unmatched double quotes on line ${i + 1}`);
        }
      }
      
      // Check for missing colons after if/for/while/def/class
      if (line.match(/^\s*(if|for|while|def|class|elif|else|try|except|finally|with)\s+.*[^:]$/)) {
        errors.push(`Missing colon on line ${i + 1}`);
      }
    }
    
    return { errors, warnings };
  }

  private basicStyleCheck(code: string): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const lines = code.split('\n');
    
    // Check for inconsistent indentation
    let hasSpaces = false;
    let hasTabs = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim()) {
        const leadingWhitespace = line.match(/^(\s*)/)?.[1] || '';
        if (leadingWhitespace.includes(' ')) hasSpaces = true;
        if (leadingWhitespace.includes('\t')) hasTabs = true;
      }
    }
    
    if (hasSpaces && hasTabs) {
      warnings.push('Inconsistent indentation (mixing spaces and tabs)');
    }
    
    // Check for very long lines
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > 120) {
        warnings.push(`Line ${i + 1} is too long (${lines[i].length} characters)`);
      }
    }
    
    return { errors, warnings };
  }

  private calculateScore(errors: string[], warnings: string[], maxScore: number): number {
    const errorPenalty = errors.length * 20;
    const warningPenalty = warnings.length * 5;
    const penalty = errorPenalty + warningPenalty;
    
    return Math.max(0, maxScore - penalty);
  }

  private generateFeedback(errors: string[], warnings: string[]): string {
    let feedback = '';
    
    if (errors.length === 0 && warnings.length === 0) {
      feedback = 'Excellent! Your code is clean and well-structured.';
    } else if (errors.length === 0) {
      feedback = 'Good work! Your code runs correctly with minor style suggestions.';
    } else {
      feedback = 'Your code has some issues that need attention.\n';
    }
    
    if (errors.length > 0) {
      feedback += '\n\n';
      const userFriendlyErrors = this.convertErrorsToUserFriendly(errors);
      userFriendlyErrors.forEach(error => {
        feedback += `• ${error}\n`;
      });
    }
    
    if (warnings.length > 0) {
      if (errors.length > 0) {
        feedback += '\n\n💡 Suggestions for improvement:\n';
      } else {
        feedback += '\n\n💡 Suggestions for improvement:\n';
      }
      const userFriendlyWarnings = this.convertWarningsToUserFriendly(warnings);
      userFriendlyWarnings.forEach(warning => {
        feedback += `• ${warning}\n`;
      });
    }
    
    return feedback.trim();
  }

  private convertErrorsToUserFriendly(errors: string[]): string[] {
    return errors.map(error => this.filterJargonAndSimplify(error));
  }

  private convertWarningsToUserFriendly(warnings: string[]): string[] {
    return warnings.map(warning => this.filterJargonAndSimplify(warning));
  }

  private filterJargonAndSimplify(message: string): string {
    // Convert technical jargon to user-friendly language
    let friendlyMessage = message;
    
    // Remove file paths and line numbers
    friendlyMessage = friendlyMessage.replace(/\/.*?\.py:\d+:\d+:/g, '');
    friendlyMessage = friendlyMessage.replace(/temp_.*?\.py:\d+:\d+:/g, '');
    
    // Convert technical terms to friendly language
    const jargonMap: { [key: string]: string } = {
      'Missing required pattern:': 'You need to include:',
      'def calculate_sum': 'a function called calculate_sum',
      'for num in numbers': 'a loop that goes through the numbers',
      'sum += num': 'add each number to a total (like sum += num)',
      'return sum': 'return the total',
      'for i in range': 'a loop using range',
      'print(i)': 'print each number',
      'def add_numbers': 'a function called add_numbers',
      'return a + b': 'return the sum of a and b',
      'max(numbers)': 'find the maximum number',
      'count("a")': 'count the letter "a"',
      'count(\'a\')': 'count the letter "a"',
      '[::-1]': 'reverse the string',
      'title()': 'capitalize each word',
      'split("\\n")': 'split by new lines',
      'split(\'\\n\')': 'split by new lines',
      'len(lines)': 'count the lines',
      'if n <= 1': 'check if n is 1 or less',
      'return n * factorial(n - 1)': 'return n times factorial of n-1',
      'while ': 'a while loop',
      'class ': 'a class',
      'self.': 'self.',
      'import ': 'import ',
      're.findall': 'use re.findall',
      're.search': 'use re.search',
      'email': 'email',
      '@': 'email address',
      'def __init__(self': 'an __init__ method',
      'self.balance': 'a balance property',
      'def deposit(self': 'a deposit method',
      'def withdraw(self': 'a withdraw method',
      'undefined-variable': 'undefined variable',
      'unused-variable': 'unused variable',
      'unused-import': 'unused import',
      'syntax error': 'syntax error',
      'indentation error': 'indentation error',
      'invalid syntax': 'invalid syntax',
      'name error': 'name error',
      'type error': 'type error',
      'attribute error': 'attribute error',
      'value error': 'value error',
      'key error': 'key error',
      'index error': 'index error',
      'runtime error': 'runtime error',
      'import error': 'import error',
      'module not found': 'module not found',
      'file not found': 'file not found',
      'permission denied': 'permission denied',
      'memory error': 'memory error',
      'recursion error': 'recursion error',
      'stop iteration': 'stop iteration',
      'system exit': 'system exit',
      'keyboard interrupt': 'keyboard interrupt',
      'generator exit': 'generator exit',
      'system error': 'system error',
      'os error': 'os error',
      'io error': 'io error',
      'connection error': 'connection error',
      'timeout error': 'timeout error',
      'ssl error': 'ssl error',
      'http error': 'http error',
      'urllib error': 'urllib error',
      'xml error': 'xml error',
      'json error': 'json error',
      'yaml error': 'yaml error',
      'csv error': 'csv error',
      'zip error': 'zip error',
      'tar error': 'tar error',
      'gzip error': 'gzip error',
      'bz2 error': 'bz2 error',
      'lzma error': 'lzma error',
      'pickle error': 'pickle error',
      'marshal error': 'marshal error',
      'shelve error': 'shelve error',
      'dbm error': 'dbm error',
      'sqlite error': 'sqlite error',
      'mysql error': 'mysql error',
      'postgresql error': 'postgresql error',
      'oracle error': 'oracle error',
      'mssql error': 'mssql error',
      'firebird error': 'firebird error',
      'sybase error': 'sybase error',
      'informix error': 'informix error',
      'ingres error': 'ingres error',
      'sap error': 'sap error',
      'db2 error': 'db2 error',
      'teradata error': 'teradata error',
      'vertica error': 'vertica error',
      'redshift error': 'redshift error',
      'bigquery error': 'bigquery error',
      'snowflake error': 'snowflake error',
      'databricks error': 'databricks error',
      'hive error': 'hive error',
      'impala error': 'impala error',
      'presto error': 'presto error',
      'trino error': 'trino error',
      'druid error': 'druid error',
      'kafka error': 'kafka error',
      'redis error': 'redis error',
      'mongodb error': 'mongodb error',
      'cassandra error': 'cassandra error',
      'elasticsearch error': 'elasticsearch error',
      'solr error': 'solr error',
      'lucene error': 'lucene error',
      'hadoop error': 'hadoop error',
      'spark error': 'spark error',
      'flink error': 'flink error',
      'storm error': 'storm error',
      'samza error': 'samza error',
      'heron error': 'heron error',
      'beam error': 'beam error'
    };
    
    // Apply jargon mapping
    Object.entries(jargonMap).forEach(([jargon, friendly]) => {
      const regex = new RegExp(jargon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      friendlyMessage = friendlyMessage.replace(regex, friendly);
    });
    
    // Clean up common technical patterns
    friendlyMessage = friendlyMessage.replace(/\s+/g, ' '); // Multiple spaces to single
    friendlyMessage = friendlyMessage.replace(/^\s*[-•]\s*/, ''); // Remove bullet points
    friendlyMessage = friendlyMessage.replace(/^[A-Za-z0-9_]+:\s*/, ''); // Remove prefixes like "E1234:"
    friendlyMessage = friendlyMessage.replace(/^[A-Za-z0-9_]+\.py:\d+:\d+:\s*/, ''); // Remove file:line:col:
    friendlyMessage = friendlyMessage.replace(/^temp_.*?\.py:\d+:\d+:\s*/, ''); // Remove temp file paths
    friendlyMessage = friendlyMessage.replace(/^.*?\.py:\d+:\d+:\s*/, ''); // Remove any file paths
    
    // Capitalize first letter
    friendlyMessage = friendlyMessage.charAt(0).toUpperCase() + friendlyMessage.slice(1);
    
    // Add helpful context for common issues
    if (friendlyMessage.includes('undefined variable')) {
      friendlyMessage += ' - Make sure you define the variable before using it';
    }
    if (friendlyMessage.includes('unused variable')) {
      friendlyMessage += ' - You can remove this variable if you\'re not using it';
    }
    if (friendlyMessage.includes('unused import')) {
      friendlyMessage += ' - You can remove this import if you\'re not using it';
    }
    if (friendlyMessage.includes('syntax error')) {
      friendlyMessage += ' - Check your spelling and punctuation';
    }
    if (friendlyMessage.includes('indentation error')) {
      friendlyMessage += ' - Make sure your indentation is consistent (use 4 spaces)';
    }
    if (friendlyMessage.includes('name error')) {
      friendlyMessage += ' - Check if the variable or function name is spelled correctly';
    }
    if (friendlyMessage.includes('type error')) {
      friendlyMessage += ' - Check if you\'re using the right type of data';
    }
    if (friendlyMessage.includes('attribute error')) {
      friendlyMessage += ' - Check if the object has the attribute you\'re trying to use';
    }
    if (friendlyMessage.includes('value error')) {
      friendlyMessage += ' - Check if the value you\'re using is valid';
    }
    if (friendlyMessage.includes('key error')) {
      friendlyMessage += ' - Check if the key exists in the dictionary';
    }
    if (friendlyMessage.includes('index error')) {
      friendlyMessage += ' - Check if the index is within the list range';
    }
    
    return friendlyMessage.trim();
  }

  async validateCode(
    code: string, 
    options: CodeValidationOptions,
    maxScore: number = 100
  ): Promise<LintingResult> {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    let output = '';
    let executionError = '';
    
    // First, check if code is empty or just comments
    const nonCommentLines = code.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('"""') && !trimmed.startsWith("'''");
    });
    
    if (nonCommentLines.length === 0) {
      allErrors.push('❌ Code cannot be empty or contain only comments. Please write actual Python code.');
      return {
        isValid: false,
        errors: allErrors,
        warnings: allWarnings,
        score: 0,
        feedback: this.generateFeedback(allErrors, allWarnings)
      };
    }
    
    // Check if there's any actual executable code
    const hasExecutableCode = nonCommentLines.some(line => {
      const trimmed = line.trim();
      return /^\s*(def|class|if|for|while|try|except|finally|with|print|return|yield|break|continue|pass|raise|assert|del|global|nonlocal)\b/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\[/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[+\-*/%=<>!&|]/.test(trimmed);
    });
    
    // Check for random characters or gibberish
    const hasValidPythonStructure = nonCommentLines.some(line => {
      const trimmed = line.trim();
      // Check for valid Python keywords, operators, or function calls
      return /^\s*(def|class|if|for|while|try|except|finally|with|print|return|yield|break|continue|raise|assert|del|global|nonlocal|import|from)\b/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[=+\-*/%<>!&|]/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(trimmed) ||
             /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\[/.test(trimmed) ||
             /^\s*[0-9]/.test(trimmed) ||
             /^\s*["'`]/.test(trimmed);
    });
    
    // Additional check: reject code that only contains function definitions with pass
    const hasOnlyPassStatements = nonCommentLines.every(line => {
      const trimmed = line.trim();
      return /^\s*def\s+\w+.*:\s*$/.test(trimmed) || 
             /^\s*pass\s*$/.test(trimmed) ||
             /^\s*class\s+\w+.*:\s*$/.test(trimmed);
    });
    
    if (hasOnlyPassStatements) {
      allErrors.push('❌ Code must contain executable statements that perform operations, not just function definitions with pass.');
      return {
        isValid: false,
        errors: allErrors,
        warnings: allWarnings,
        score: 0,
        feedback: this.generateFeedback(allErrors, allWarnings)
      };
    }
    
    if (!hasExecutableCode) {
      allErrors.push('❌ Code must contain executable Python statements. Please write actual code that performs operations.');
      return {
        isValid: false,
        errors: allErrors,
        warnings: allWarnings,
        score: 0,
        feedback: this.generateFeedback(allErrors, allWarnings)
      };
    }
    
    if (!hasValidPythonStructure) {
      allErrors.push('❌ Code contains invalid Python syntax or random characters. Please write proper Python code.');
      return {
        isValid: false,
        errors: allErrors,
        warnings: allWarnings,
        score: 0,
        feedback: this.generateFeedback(allErrors, allWarnings)
      };
    }
    
    // Check syntax and basic issues
    if (options.checkSyntax) {
      const pyflakesResult = await this.runPyflakes(code);
      allErrors.push(...pyflakesResult.errors);
      allWarnings.push(...pyflakesResult.warnings);
    }
    
    // Check style and advanced issues
    if (options.checkStyle) {
      const pylintResult = await this.runPylint(code);
      allErrors.push(...pylintResult.errors);
      allWarnings.push(...pylintResult.warnings);
    }
    
    // Execute code if requested - this is MANDATORY for validation
    if (options.executeCode) {
      const isPythonAvailable = await this.checkPythonAvailability();
      if (isPythonAvailable) {
        // Add test cases based on the stage
        const testCode = this.getTestCodeForStage(options, code);
        const executionResult = await this.executePythonCode(code, testCode);
        output = executionResult.output;
        executionError = executionResult.error;
        
        if (!executionResult.success) {
          allErrors.push(`❌ Code execution failed: ${executionResult.error}`);
        } else if (options.expectedOutput && executionResult.output !== options.expectedOutput) {
          allErrors.push(`❌ Wrong output! Expected: "${options.expectedOutput}", but got: "${executionResult.output}"`);
        } else if (options.expectedOutput && !executionResult.output) {
          allErrors.push(`❌ No output produced! Expected: "${options.expectedOutput}"`);
        }
      } else {
        allWarnings.push('Python not available for code execution');
      }
    }
    
    // Check required patterns
    if (options.requiredPatterns) {
      const missingPatterns = this.checkRequiredPatterns(code, options.requiredPatterns);
      allErrors.push(...missingPatterns);
    }
    
    // Check forbidden patterns
    if (options.forbiddenPatterns) {
      const violations = this.checkForbiddenPatterns(code, options.forbiddenPatterns);
      allErrors.push(...violations);
    }
    
    const score = this.calculateScore(allErrors, allWarnings, maxScore);
    const feedback = this.generateFeedback(allErrors, allWarnings);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      score,
      feedback,
      output: output || undefined,
      executionError: executionError || undefined
    };
  }

  // Stage-specific validation methods
  async validateStage1(code: string): Promise<LintingResult> {
    return this.validateCode(code, {
      checkSyntax: true,
      checkStyle: true,
      checkLogic: true,
      executeCode: true,
      expectedOutput: '15', // Expected output for calculate_sum([1, 2, 3, 4, 5])
      requiredPatterns: ['def calculate_sum', 'for num in numbers', 'sum += num', 'return sum']
    }, 125);
  }

  async validateStage2(code: string): Promise<LintingResult> {
    return this.validateCode(code, {
      checkSyntax: true,
      checkStyle: true,
      checkLogic: true,
      executeCode: true,
      expectedOutput: '0\n1\n2\n3\n4', // Expected output for range(5)
      requiredPatterns: ['for i in range', 'print(i)']
    }, 125);
  }

  async validateStage3(code: string): Promise<LintingResult> {
    return this.validateCode(code, {
      checkSyntax: true,
      checkStyle: true,
      checkLogic: true,
      executeCode: true,
      expectedOutput: '8', // Expected output for add_numbers(3, 5)
      requiredPatterns: ['def add_numbers', 'return a + b']
    }, 100);
  }

  // Generic stage validator
  async validateStage(stageId: number, code: string, maxScore: number = 100): Promise<LintingResult> {
    const options: CodeValidationOptions = {
      checkSyntax: true,
      checkStyle: true,
      checkLogic: true
    };

    // Add stage-specific requirements
    switch (stageId) {
      case 1:
        options.requiredPatterns = ['def calculate_sum', 'for num in numbers', 'sum += num', 'return sum'];
        options.executeCode = true;
        options.expectedOutput = '15';
        break;
      case 2:
        options.requiredPatterns = ['for i in range', 'print(i)'];
        options.executeCode = true;
        options.expectedOutput = '0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20\n21\n22\n23\n24\n25\n26\n27\n28\n29\n30\n31\n32\n33\n34\n35\n36\n37\n38\n39\n40\n41\n42\n43\n44\n45\n46\n47\n48\n49\n50\n51\n52\n53\n54\n55\n56\n57\n58\n59\n60\n61\n62\n63\n64\n65\n66\n67\n68\n69\n70\n71\n72\n73\n74\n75\n76\n77\n78\n79\n80\n81\n82\n83\n84\n85\n86\n87\n88\n89\n90\n91\n92\n93\n94\n95\n96\n97\n98\n99\n100\n101\n102\n103\n104\n105\n106\n107\n108\n109\n110\n111\n112\n113\n114\n115\n116\n117\n118\n119\n120\n121\n122\n123\n124\n125\n126\n127\n128\n129\n130\n131\n132\n133\n134\n135\n136\n137\n138\n139\n140\n141\n142\n143\n144\n145\n146\n147\n148\n149\n150\n151\n152\n153\n154\n155\n156\n157\n158\n159\n160\n161\n162\n163\n164\n165\n166\n167\n168\n169\n170\n171\n172\n173\n174\n175\n176\n177\n178\n179\n180\n181\n182\n183\n184\n185\n186\n187\n188\n189\n190\n191\n192\n193\n194\n195\n196\n197\n198\n199\n200\n201\n202\n203\n204\n205\n206\n207\n208\n209\n210\n211\n212\n213\n214\n215\n216\n217\n218\n219\n220\n221\n222\n223\n224\n225\n226\n227\n228\n229\n230\n231\n232\n233\n234\n235\n236\n237\n238\n239\n240\n241\n242\n243\n244\n245\n246\n247\n248\n249\n250\n251\n252\n253\n254\n255\n256\n257\n258\n259\n260\n261\n262\n263\n264\n265\n266\n267\n268\n269\n270\n271\n272\n273\n274\n275\n276\n277\n278\n279\n280\n281\n282\n283\n284\n285\n286\n287\n288\n289\n290\n291\n292\n293\n294\n295\n296\n297\n298\n299\n300\n301\n302\n303\n304\n305\n306\n307\n308\n309\n310\n311\n312\n313\n314\n315\n316\n317\n318\n319\n320\n321\n322\n323\n324\n325\n326\n327\n328\n329\n330\n331\n332\n333\n334\n335\n336\n337\n338\n339\n340\n341\n342\n343\n344\n345\n346\n347\n348\n349\n350\n351\n352\n353\n354\n355\n356\n357\n358\n359\n360\n361\n362\n363\n364\n365\n366\n367\n368\n369\n370\n371\n372\n373\n374\n375\n376\n377\n378\n379\n380\n381\n382\n383\n384\n385\n386\n387\n388\n389\n390\n391\n392\n393\n394\n395\n396\n397\n398\n399\n400\n401\n402\n403\n404\n405\n406\n407\n408\n409\n410\n411\n412\n413\n414\n415\n416\n417\n418\n419\n420\n421\n422\n423\n424\n425\n426\n427\n428\n429\n430\n431\n432\n433\n434\n435\n436\n437\n438\n439\n440\n441\n442\n443\n444\n445\n446\n447\n448\n449\n450\n451\n452\n453\n454\n455\n456\n457\n458\n459\n460\n461\n462\n463\n464\n465\n466\n467\n468\n469\n470\n471\n472\n473\n474\n475\n476\n477\n478\n479\n480\n481\n482\n483\n484\n485\n486\n487\n488\n489\n490\n491\n492\n493\n494\n495\n496\n497\n498\n499\n500\n501\n502\n503\n504\n505\n506\n507\n508\n509\n510\n511\n512\n513\n514\n515\n516\n517\n518\n519\n520\n521\n522\n523\n524\n525\n526\n527\n528\n529\n530\n531\n532\n533\n534\n535\n536\n537\n538\n539\n540\n541\n542\n543\n544\n545\n546\n547\n548\n549\n550\n551\n552\n553\n554\n555\n556\n557\n558\n559\n560\n561\n562\n563\n564\n565\n566\n567\n568\n569\n570\n571\n572\n573\n574\n575\n576\n577\n578\n579\n580\n581\n582\n583\n584\n585\n586\n587\n588\n589\n590\n591\n592\n593\n594\n595\n596\n597\n598\n599\n600\n601\n602\n603\n604\n605\n606\n607\n608\n609\n610\n611\n612\n613\n614\n615\n616\n617\n618\n619\n620\n621\n622\n623\n624\n625\n626\n627\n628\n629\n630\n631\n632\n633\n634\n635\n636\n637\n638\n639\n640\n641\n642\n643\n644\n645\n646\n647\n648\n649\n650\n651\n652\n653\n654\n655\n656\n657\n658\n659\n660\n661\n662\n663\n664\n665\n666\n667\n668\n669\n670\n671\n672\n673\n674\n675\n676\n677\n678\n679\n680\n681\n682\n683\n684\n685\n686\n687\n688\n689\n690\n691\n692\n693\n694\n695\n696\n697\n698\n699\n700\n701\n702\n703\n704\n705\n706\n707\n708\n709\n710\n711\n712\n713\n714\n715\n716\n717\n718\n719\n720\n721\n722\n723\n724\n725\n726\n727\n728\n729\n730\n731\n732\n733\n734\n735\n736\n737\n738\n739\n740\n741\n742\n743\n744\n745\n746\n747\n748\n749\n750\n751\n752\n753\n754\n755\n756\n757\n758\n759\n760\n761\n762\n763\n764\n765\n766\n767\n768\n769\n770\n771\n772\n773\n774\n775\n776\n777\n778\n779\n780\n781\n782\n783\n784\n785\n786\n787\n788\n789\n790\n791\n792\n793\n794\n795\n796\n797\n798\n799\n800\n801\n802\n803\n804\n805\n806\n807\n808\n809\n810\n811\n812\n813\n814\n815\n816\n817\n818\n819\n820\n821\n822\n823\n824\n825\n826\n827\n828\n829\n830\n831\n832\n833\n834\n835\n836\n837\n838\n839\n840\n841\n842\n843\n844\n845\n846\n847\n848\n849\n850\n851\n852\n853\n854\n855\n856\n857\n858\n859\n860\n861\n862\n863\n864\n865\n866\n867\n868\n869\n870\n871\n872\n873\n874\n875\n876\n877\n878\n879\n880\n881\n882\n883\n884\n885\n886\n887\n888\n889\n890\n891\n892\n893\n894\n895\n896\n897\n898\n899\n900\n901\n902\n903\n904\n905\n906\n907\n908\n909\n910\n911\n912\n913\n914\n915\n916\n917\n918\n919\n920\n921\n922\n923\n924\n925\n926\n927\n928\n929\n930\n931\n932\n933\n934\n935\n936\n937\n938\n939\n940\n941\n942\n943\n944\n945\n946\n947\n948\n949\n950\n951\n952\n953\n954\n955\n956\n957\n958\n959\n960\n961\n962\n963\n964\n965\n966\n967\n968\n969\n970\n971\n972\n973\n974\n975\n976\n977\n978\n979\n980\n981\n982\n983\n984\n985\n986\n987\n988\n989\n990\n991\n992\n993\n994\n995\n996\n997\n998\n999\n1000';
        break;
      case 3:
        options.requiredPatterns = ['def add_numbers', 'return a + b'];
        options.executeCode = true;
        options.expectedOutput = '8';
        break;
      case 4:
        options.requiredPatterns = ['for i in range', 'print("*" * i)'];
        options.executeCode = true;
        options.expectedOutput = '*\n**\n***\n****';
        break;
      case 5:
        options.requiredPatterns = ['max(numbers)'];
        options.executeCode = true;
        options.expectedOutput = '9';
        break;
      case 6:
        options.requiredPatterns = ['count("a")', "count('a')"];
        options.executeCode = true;
        options.expectedOutput = '3';
        break;
      case 7:
        options.requiredPatterns = ['[::-1]'];
        options.executeCode = true;
        options.expectedOutput = 'olleh';
        break;
      case 8:
        options.requiredPatterns = ['def find_maximum', 'arr[0]', 'for ', 'if ', 'return '];
        options.executeCode = true;
        options.expectedOutput = '9';
        break;
      case 9:
        options.requiredPatterns = ['a, b = 0, 1', 'a, b = b, a + b'];
        options.executeCode = true;
        options.expectedOutput = '0\n1\n1\n2\n3\n5\n8\n13\n21\n34';
        break;
      case 10:
        options.requiredPatterns = ['def is_prime', 'int(n**0.5)', 'if n % i == 0', 'return True'];
        options.executeCode = true;
        options.expectedOutput = 'True\nFalse';
        break;
      case 11:
        options.requiredPatterns = ['[', 'for ', '**'];
        options.executeCode = true;
        options.expectedOutput = '[1, 4, 9, 16, 25]';
        break;
      case 12:
        options.requiredPatterns = ['max(', 'key=', 'get'];
        options.executeCode = true;
        options.expectedOutput = 'Diana';
        break;
      case 13:
        options.requiredPatterns = ['title()'];
        options.executeCode = true;
        options.expectedOutput = 'Hello World Python Programming';
        break;
      case 14:
        options.requiredPatterns = ['split(', 'len('];
        options.executeCode = true;
        options.expectedOutput = '4';
        break;
      case 15:
        options.requiredPatterns = ['split(', 'obj[', 'for i in range'];
        options.executeCode = true;
        options.expectedOutput = "[{'name': 'Alice', 'age': '30', 'city': 'New York'}, {'name': 'Bob', 'age': '25', 'city': 'London'}, {'name': 'Charlie', 'age': '35', 'city': 'Tokyo'}]";
        break;
      case 16:
        options.requiredPatterns = ['for i in range', 'for j in range', 'arr[j]', 'arr[j + 1]'];
        options.executeCode = true;
        options.expectedOutput = '[11, 12, 22, 25, 34, 64, 90]';
        break;
      case 17:
        options.requiredPatterns = ['def factorial', 'if n <= 1', 'return n * factorial'];
        options.executeCode = true;
        options.expectedOutput = '120';
        break;
      case 18:
        options.requiredPatterns = ['left', 'right', 'mid', 'while'];
        options.executeCode = true;
        options.expectedOutput = '3\n-1';
        break;
      case 19:
        options.requiredPatterns = ['re.', '@', 'email'];
        options.executeCode = true;
        options.expectedOutput = "['john@example.com', 'support@company.org']";
        break;
      case 20:
        options.requiredPatterns = ['class ', 'def __init__', 'def deposit', 'def withdraw'];
        options.executeCode = true;
        options.expectedOutput = '120';
        break;
      default:
        // Generic validation for unknown stages
        break;
    }

    return this.validateCode(code, options, maxScore);
  }
}

export const escapeRoomLinter = new EscapeRoomLinter();


// Used Support of AI Tool to Build this Code - Genimi Flash 2.5
