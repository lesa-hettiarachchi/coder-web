// Test to see which linter version is running in cloud vs localhost
const http = require('http');

async function testLinterVersion(hostname, port, label) {
    console.log(`\n=== Testing ${label} ===`);
    
    // Test with function definition + pass (should be rejected with new linter)
    const testCode = 'def some_function():\n    pass';
    
    const postData = JSON.stringify({
        stageId: 921, // First stage in database
        userCode: testCode,
        sessionId: 'version-test'
    });

    const options = {
        hostname,
        port,
        path: '/api/escape-room/check-answer',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`${label} linter result:`);
                    console.log('- Is Correct:', result.isCorrect);
                    console.log('- Score:', result.points);
                    console.log('- Method:', result.method);
                    console.log('- Feedback:', result.feedback?.substring(0, 100) + '...');
                    
                    if (result.isCorrect) {
                        console.log(`\n❌ OLD LINTER: Function with pass was accepted (WRONG!)`);
                    } else {
                        console.log(`\n✅ NEW LINTER: Function with pass was rejected (CORRECT!)`);
                    }
                    
                    resolve(result);
                } catch (error) {
                    console.error('Parse error:', error.message);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('Request error:', error.message);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function testBoth() {
    console.log('Testing linter versions...\n');
    
    try {
        // Test localhost (port 3000)
        await testLinterVersion('localhost', 3000, 'Localhost');
    } catch (error) {
        console.log('Localhost test failed (probably not running):', error.message);
    }
    
    try {
        // Test cloud (port 80)
        await testLinterVersion('localhost', 80, 'Cloud');
    } catch (error) {
        console.log('Cloud test failed:', error.message);
    }
}

testBoth();
