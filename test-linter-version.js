// Test to see which linter version is running in the cloud
const http = require('http');

async function testLinterVersion() {
    console.log('Testing linter version in cloud...\n');
    
    // Test with function definition + pass (should be rejected with new linter)
    const testCode = 'def some_function():\n    pass';
    
    const postData = JSON.stringify({
        stageId: 921, // First stage in database
        userCode: testCode,
        sessionId: 'version-test'
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
                console.log('Cloud linter result:');
                console.log('- Is Correct:', result.isCorrect);
                console.log('- Score:', result.points);
                console.log('- Method:', result.method);
                console.log('- Feedback:', result.feedback);
                
                if (result.isCorrect) {
                    console.log('\n❌ OLD LINTER: Function with pass was accepted (WRONG!)');
                } else {
                    console.log('\n✅ NEW LINTER: Function with pass was rejected (CORRECT!)');
                }
            } catch (error) {
                console.error('Parse error:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Request error:', error.message);
    });

    req.write(postData);
    req.end();
}

testLinterVersion();
