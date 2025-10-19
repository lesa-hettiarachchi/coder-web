// Debug script to test what the browser is actually sending
const http = require('http');

// Test with different stage IDs to see which one the browser might be using
const testCases = [
    { stageId: 1, description: "Stage ID 1 (old)" },
    { stageId: 881, description: "Stage ID 881 (current)" },
    { stageId: 882, description: "Stage ID 882 (next stage)" }
];

async function testAllStages() {
    for (const testCase of testCases) {
        console.log(`\n=== Testing ${testCase.description} ===`);
        
        const postData = JSON.stringify({
            stageId: testCase.stageId,
            userCode: '# This is just a comment',
            sessionId: 'browser-test'
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

        try {
            const result = await makeRequest(options, postData);
            console.log('Response:', {
                isCorrect: result.isCorrect,
                points: result.points,
                method: result.method,
                feedback: result.feedback?.substring(0, 100) + '...'
            });
        } catch (error) {
            console.log('Error:', error.message);
        }
    }
}

function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
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

testAllStages();
