// Test all 20 escape room questions
const http = require('http');

// Get all available stages first
async function getAllStages() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 80,
            path: '/api/escape-room/questions?count=20',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result.stages);
                } catch (error) {
                    reject(new Error(`Parse error: ${error.message}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Test a single stage
async function testStage(stageId, stageTitle, userCode, testType) {
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
                    resolve({
                        stageId,
                        stageTitle,
                        testType,
                        isCorrect: result.isCorrect,
                        score: result.points,
                        method: result.method,
                        feedback: result.feedback?.substring(0, 100) + '...' || 'No feedback'
                    });
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

// Test all stages
async function testAllStages() {
    console.log('🔍 Getting all available stages...\n');
    
    try {
        const stages = await getAllStages();
        console.log(`Found ${stages.length} stages\n`);
        
        const results = [];
        
        for (const stage of stages) {
            console.log(`=== Testing Stage ${stage.id}: ${stage.title} (${stage.difficulty}) ===`);
            
            // Test 1: Comment-only code (should be rejected)
            const commentResult = await testStage(
                stage.id, 
                stage.title, 
                '# This is just a comment\n# Another comment', 
                'Comment-only'
            );
            results.push(commentResult);
            console.log(`Comment-only: ${commentResult.isCorrect ? '❌ ACCEPTED (WRONG!)' : '✅ REJECTED (CORRECT)'} - Score: ${commentResult.score}`);
            
            // Test 2: Random characters (should be rejected)
            const randomResult = await testStage(
                stage.id, 
                stage.title, 
                'asdfghjkl qwerty 12345', 
                'Random characters'
            );
            results.push(randomResult);
            console.log(`Random chars: ${randomResult.isCorrect ? '❌ ACCEPTED (WRONG!)' : '✅ REJECTED (CORRECT)'} - Score: ${randomResult.score}`);
            
            // Test 3: Just function definition (should be rejected)
            const funcResult = await testStage(
                stage.id, 
                stage.title, 
                'def some_function():\n    pass', 
                'Function definition only'
            );
            results.push(funcResult);
            console.log(`Func only: ${funcResult.isCorrect ? '❌ ACCEPTED (WRONG!)' : '✅ REJECTED (CORRECT)'} - Score: ${funcResult.score}`);
            
            console.log('---\n');
        }
        
        // Summary
        console.log('📊 SUMMARY:');
        console.log('===========');
        
        const commentTests = results.filter(r => r.testType === 'Comment-only');
        const randomTests = results.filter(r => r.testType === 'Random characters');
        const funcTests = results.filter(r => r.testType === 'Function definition only');
        
        console.log(`Comment-only tests: ${commentTests.filter(r => !r.isCorrect).length}/${commentTests.length} correctly rejected`);
        console.log(`Random char tests: ${randomTests.filter(r => !r.isCorrect).length}/${randomTests.length} correctly rejected`);
        console.log(`Func-only tests: ${funcTests.filter(r => !r.isCorrect).length}/${funcTests.length} correctly rejected`);
        
        const totalTests = results.length;
        const correctRejections = results.filter(r => !r.isCorrect).length;
        console.log(`\nOverall: ${correctRejections}/${totalTests} tests correctly rejected invalid code`);
        
        if (correctRejections === totalTests) {
            console.log('🎉 ALL TESTS PASSED! The linter is working perfectly!');
        } else {
            console.log('❌ Some tests failed. The linter has issues.');
            
            // Show failed tests
            const failedTests = results.filter(r => r.isCorrect);
            console.log('\nFailed tests (should be rejected but were accepted):');
            failedTests.forEach(test => {
                console.log(`- Stage ${test.stageId} (${test.stageTitle}): ${test.testType}`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAllStages();
