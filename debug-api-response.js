// Debug the actual API response for both localhost and cloud
const http = require('http');

async function debugAPIResponse(hostname, port, label) {
    console.log(`\n=== Debugging ${label} (${hostname}:${port}) ===`);
    
    const testCode = 'def some_function():\n    pass';
    
    const postData = JSON.stringify({
        stageId: 921,
        userCode: testCode,
        sessionId: 'debug-test'
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
            console.log('Status Code:', res.statusCode);
            console.log('Headers:', res.headers);
            
            let data = '';
            res.on('data', (chunk) => { 
                data += chunk;
                console.log('Chunk received:', chunk.toString());
            });
            
            res.on('end', () => {
                console.log('\nRaw Response:');
                console.log(data);
                
                try {
                    const result = JSON.parse(data);
                    console.log('\nParsed Response:');
                    console.log(JSON.stringify(result, null, 2));
                    
                    if (result.isCorrect === undefined) {
                        console.log('\n❌ API is returning undefined values - there might be an error');
                    } else if (result.isCorrect) {
                        console.log('\n❌ OLD LINTER: Function with pass was accepted');
                    } else {
                        console.log('\n✅ NEW LINTER: Function with pass was rejected');
                    }
                    
                    resolve(result);
                } catch (error) {
                    console.error('JSON Parse Error:', error.message);
                    console.log('Raw data that failed to parse:', data);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('Request Error:', error.message);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function testBoth() {
    console.log('Debugging API responses...\n');
    
    try {
        // Test localhost (port 3000)
        await debugAPIResponse('localhost', 3000, 'Localhost');
    } catch (error) {
        console.log('Localhost test failed:', error.message);
    }
    
    try {
        // Test cloud (port 80)
        await debugAPIResponse('localhost', 80, 'Cloud');
    } catch (error) {
        console.log('Cloud test failed:', error.message);
    }
}

testBoth();
