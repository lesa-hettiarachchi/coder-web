// Test to see what the browser is actually doing
const http = require('http');

// Test all the stage IDs that the frontend might be using
const frontendStages = [884, 887, 891, 899];

async function testAllFrontendStages() {
    console.log('Testing all stages that the frontend might be using...\n');
    
    for (const stageId of frontendStages) {
        console.log(`=== Testing Stage ${stageId} ===`);
        
        // Test comment-only code
        const commentResult = await testStage(stageId, '# This is just a comment');
        console.log('Comment-only code:', {
            isCorrect: commentResult.isCorrect,
            score: commentResult.points,
            method: commentResult.method,
            hasFeedback: !!commentResult.feedback
        });
        
        // Test correct solution for this stage
        const correctCode = getCorrectCodeForStage(stageId);
        const correctResult = await testStage(stageId, correctCode);
        console.log('Correct code:', {
            isCorrect: correctResult.isCorrect,
            score: correctResult.points,
            method: correctResult.method
        });
        
        console.log('---\n');
    }
}

function getCorrectCodeForStage(stageId) {
    // Based on the stage titles we saw
    switch (stageId) {
        case 884: // Print Pattern
            return 'for i in range(1, 5):\n    print("*" * i)';
        case 887: // Reverse String
            return 'text = "hello"\nprint(text[::-1])';
        case 891: // List Comprehension
            return 'numbers = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in numbers]\nprint(squares)';
        case 899: // Regular Expression
            return 'import re\nemails = "john@example.com, support@company.org"\nmatches = re.findall(r"[\\w.-]+@[\\w.-]+", emails)\nprint(matches)';
        default:
            return 'print("test")';
    }
}

function testStage(stageId, userCode) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            stageId,
            userCode,
            sessionId: 'test-session'
        });

        const options = {
            hostname: 'localhost',
            port: 80,
            path: '/api/escape-room/check-answer',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (error) {
                    reject(new Error(`Parse error: ${error.message}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

testAllFrontendStages().catch(console.error);
