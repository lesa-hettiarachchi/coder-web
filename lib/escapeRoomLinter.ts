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
}

export interface CodeValidationOptions {
  checkSyntax: boolean;
  checkStyle: boolean;
  checkLogic: boolean;
  requiredPatterns?: string[];
  forbiddenPatterns?: string[];
}

export class EscapeRoomLinter {
  private async runPyflakes(code: string): Promise<{ errors: string[]; warnings: string[] }> {
    try {
      // Create a temporary file to check
      const tempFile = path.join(os.tmpdir(), `temp_${Date.now()}.py`);
      fs.writeFileSync(tempFile, code);
      
      const { stderr } = await execAsync(`python -m pyflakes "${tempFile}"`);
      
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
      // If Python is not available, fall back to basic syntax checking
      console.warn('Python not available, using basic syntax checking');
      return this.basicSyntaxCheck(code);
    }
  }

  private async runPylint(code: string): Promise<{ errors: string[]; warnings: string[] }> {
    try {
      const tempFile = path.join(os.tmpdir(), `temp_${Date.now()}.py`);
      fs.writeFileSync(tempFile, code);
      
      const { stdout, stderr } = await execAsync(`python -m pylint --disable=all --enable=unused-variable,undefined-variable,unused-import "${tempFile}"`);
      
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
      // If Python is not available, fall back to basic style checking
      console.warn('Python not available, using basic style checking');
      return this.basicStyleCheck(code);
    }
  }

  private checkRequiredPatterns(code: string, patterns: string[]): string[] {
    const missing: string[] = [];
    
    patterns.forEach(pattern => {
      if (!this.checkPatternFlexibly(code, pattern)) {
        missing.push(`Missing required pattern: ${pattern}`);
      }
    });
    
    return missing;
  }

  private checkPatternFlexibly(code: string, pattern: string): boolean {
    // Normalize code for comparison
    const normalizedCode = code.toLowerCase().replace(/\s+/g, ' ');
    
    // Handle different pattern types
    if (pattern.includes('def ')) {
      // Function definition - check for function name and structure
      const funcName = pattern.replace('def ', '').split('(')[0];
      return normalizedCode.includes(`def ${funcName.toLowerCase()}`);
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
             normalizedCode.includes('range(') &&
             normalizedCode.includes('int(') &&
             normalizedCode.includes('**0.5');
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
             (normalizedCode.includes('"\\n"') || normalizedCode.includes("'\\n'"));
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
      
      // Check for unmatched quotes
      const singleQuotes = (line.match(/'/g) || []).length;
      const doubleQuotes = (line.match(/"/g) || []).length;
      if (singleQuotes % 2 !== 0) {
        errors.push(`Unmatched single quotes on line ${i + 1}`);
      }
      if (doubleQuotes % 2 !== 0) {
        errors.push(`Unmatched double quotes on line ${i + 1}`);
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
      feedback = '🎉 Excellent! Your code is clean and well-structured.';
    } else if (errors.length === 0) {
      feedback = '✅ Good work! Your code runs correctly with minor style suggestions.';
    } else {
      feedback = '❌ Your code has some issues that need attention.';
    }
    
    if (errors.length > 0) {
      feedback += '\n\n🔍 Issues to fix:';
      const userFriendlyErrors = this.convertErrorsToUserFriendly(errors.slice(0, 3));
      userFriendlyErrors.forEach(error => {
        feedback += `\n• ${error}`;
      });
      
      if (errors.length > 3) {
        feedback += `\n• ... and ${errors.length - 3} more issues`;
      }
    }
    
    if (warnings.length > 0) {
      feedback += '\n\n💡 Suggestions for improvement:';
      const userFriendlyWarnings = this.convertWarningsToUserFriendly(warnings.slice(0, 2));
      userFriendlyWarnings.forEach(warning => {
        feedback += `\n• ${warning}`;
      });
      
      if (warnings.length > 2) {
        feedback += `\n• ... and ${warnings.length - 2} more suggestions`;
      }
    }
    
    return feedback;
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
      feedback
    };
  }

  // Stage-specific validation methods
  async validateStage1(code: string): Promise<LintingResult> {
    return this.validateCode(code, {
      checkSyntax: true,
      checkStyle: true,
      checkLogic: true,
      requiredPatterns: ['def calculate_sum', 'for num in numbers', 'sum += num', 'return sum']
    }, 125);
  }

  async validateStage2(code: string): Promise<LintingResult> {
    return this.validateCode(code, {
      checkSyntax: true,
      checkStyle: true,
      checkLogic: true,
      requiredPatterns: ['for i in range', 'print(i)']
    }, 125);
  }

  async validateStage3(code: string): Promise<LintingResult> {
    return this.validateCode(code, {
      checkSyntax: true,
      checkStyle: true,
      checkLogic: true,
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
        break;
      case 2:
        options.requiredPatterns = ['for i in range', 'print(i)'];
        break;
      case 3:
        options.requiredPatterns = ['def add_numbers', 'return a + b'];
        break;
      case 4:
        options.requiredPatterns = ['for i in range', 'print("*" * i)'];
        break;
      case 5:
        options.requiredPatterns = ['max(numbers)'];
        break;
      case 6:
        options.requiredPatterns = ['count("a")', "count('a')"];
        break;
      case 7:
        options.requiredPatterns = ['[::-1]'];
        break;
      case 8:
        options.requiredPatterns = ['max_val = arr[0]'];
        break;
      case 9:
        options.requiredPatterns = ['a, b = 0, 1', 'a, b = b, a + b'];
        break;
      case 10:
        options.requiredPatterns = ['for i in range(2, int(n**0.5) + 1)', 'if n % i == 0'];
        break;
      case 11:
        options.requiredPatterns = ['[x**2 for x in numbers]'];
        break;
      case 12:
        options.requiredPatterns = ['max(scores, key=scores.get)'];
        break;
      case 13:
        options.requiredPatterns = ['title()'];
        break;
      case 14:
        options.requiredPatterns = ['split("\\n")', "split('\\n')", 'len(lines)'];
        break;
      case 15:
        options.requiredPatterns = ['split("\\n")', "split(',')", 'obj[headers[i]] = values[i]'];
        break;
      case 16:
        options.requiredPatterns = ['for i in range(n)', 'for j in range(0, n - i - 1)', 'arr[j], arr[j + 1] = arr[j + 1], arr[j]'];
        break;
      case 17:
        options.requiredPatterns = ['if n <= 1', 'return n * factorial(n - 1)'];
        break;
      case 18:
        options.requiredPatterns = ['left', 'right', 'mid', 'while'];
        break;
      case 19:
        options.requiredPatterns = ['re.findall', 're.search', '@', 'email'];
        break;
      case 20:
        options.requiredPatterns = ['def __init__(self', 'self.balance', 'def deposit(self', 'def withdraw(self'];
        break;
      default:
        // Generic validation for unknown stages
        break;
    }

    return this.validateCode(code, options, maxScore);
  }
}

export const escapeRoomLinter = new EscapeRoomLinter();
