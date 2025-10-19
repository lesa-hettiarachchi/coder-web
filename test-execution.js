// Test script to demonstrate the enhanced escape room linter with code execution
const { escapeRoomLinter } = require('./lib/escapeRoomLinter.ts');

async function testExecution() {
  console.log('Testing Enhanced Escape Room Linter with Code Execution...\n');
  
  // Test 1: Valid code that should pass execution
  console.log('Test 1: Valid calculate_sum function');
  const result1 = await escapeRoomLinter.validateStage1(`
def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total
  `);
  console.log('Valid:', result1.isValid);
  console.log('Output:', result1.output);
  console.log('Score:', result1.score);
  console.log('Errors:', result1.errors);
  console.log('---\n');
  
  // Test 2: Wrong code that should fail execution
  console.log('Test 2: Wrong calculate_sum function (returns 0)');
  const result2 = await escapeRoomLinter.validateStage1(`
def calculate_sum(numbers):
    return 0  # Wrong implementation
  `);
  console.log('Valid:', result2.isValid);
  console.log('Output:', result2.output);
  console.log('Expected: 15');
  console.log('Score:', result2.score);
  console.log('Errors:', result2.errors);
  console.log('---\n');
  
  // Test 3: Code with syntax error
  console.log('Test 3: Code with syntax error');
  const result3 = await escapeRoomLinter.validateStage1(`
def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total  # Missing colon
  `);
  console.log('Valid:', result3.isValid);
  console.log('Output:', result3.output);
  console.log('Execution Error:', result3.executionError);
  console.log('Score:', result3.score);
  console.log('Errors:', result3.errors);
  console.log('---\n');
  
  // Test 4: Comment-only code
  console.log('Test 4: Comment-only code');
  const result4 = await escapeRoomLinter.validateStage1(`
# This is just a comment
# No actual code here
  `);
  console.log('Valid:', result4.isValid);
  console.log('Score:', result4.score);
  console.log('Errors:', result4.errors);
  console.log('---\n');
}

testExecution().catch(console.error);
