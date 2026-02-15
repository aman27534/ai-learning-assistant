const http = require('http');

async function testEndpoint(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3002,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ status: res.statusCode, body: JSON.parse(data) });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('Testing Productivity Service...');

    // Wait a bit for server to start if running via script
    await new Promise(r => setTimeout(r, 1000));

    try {
        // Test Health
        console.log('\nTesting /health...');
        const health = await testEndpoint('/health', 'GET');
        console.log('Health:', health.status, health.body);

        // Test Analyze
        console.log('\nTesting /analyze...');
        const analysis = await testEndpoint('/analyze', 'POST', {
            code: 'function test() { console.log("hello"); }',
            language: 'typescript'
        });
        console.log('Analysis:', analysis.status, JSON.stringify(analysis.body, null, 2));

    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTests();
