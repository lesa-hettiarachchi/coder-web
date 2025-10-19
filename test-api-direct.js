const https = require('https');
const http = require('http');

// Test the API directly
async function testAPI() {
    const testCases = [
        {
            name: "Comment-only code",
            stageId: 1,
            userCode: "# This is just a comment\n# Another comment",
            sessionId: "test-session-1"
        },
        {
            name: "Random characters",
            stageId: 1,
            userCode: "asdfghjkl qwerty",
            sessionId: "test-session-2"
        },
        {
            name: "Just function definition",
            stageId: 1,
            userCode: "def calculate_sum(numbers):\n    pass",
            sessionId: "test-session-3"
        },
        {
            name: "Correct solution",
            stageId: 1,
            userCode: "def calculate_sum(numbers):\n    sum = 0\n    for num in numbers:\n        sum += num\n    return sum\n\nprint(calculate_sum([1, 2, 3, 4, 5]))",
            sessionId: "test-session-4"
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n=== Testing: ${testCase.name} ===`);
        
        try {
            const result = await makeAPIRequest(testCase);
            console.log('API Response:');
            console.log('- Is Correct:', result.isCorrect);
            console.log('- Score:', result.points);
            console.log('- Feedback:', result.feedback);
            if (result.lintingDetails) {
                console.log('- Errors:', result.lintingDetails.errors);
                console.log('- Warnings:', result.lintingDetails.warnings);
            }
        } catch (error) {
            console.error('API Error:', error.message);
        }
    }
}

function makeAPIRequest(testCase) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            stageId: testCase.stageId,
            userCode: testCase.userCode,
            sessionId: testCase.sessionId
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
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });

        req.write(postData);
        req.end();
    });
}

// Run the test
testAPI().catch(console.error);
