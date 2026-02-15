const http = require('http');

async function testEndpoint(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3003,
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
    console.log('Testing Knowledge Graph Service...');

    // Wait a bit for server to start if running via script
    await new Promise(r => setTimeout(r, 1000));

    try {
        // Test Health
        console.log('\nTesting /health...');
        const health = await testEndpoint('/health', 'GET');
        console.log('Health:', health.status, health.body);

        // Test Create Concept (might fail if no Neo4j, but should return 503 or error)
        console.log('\nTesting /concepts (Create)...');
        try {
            const concept = await testEndpoint('/concepts', 'POST', {
                name: 'TestConcept',
                description: 'A test concept',
                type: 'Test'
            });
            console.log('Create Concept:', concept.status, concept.body);
        } catch (e) {
            console.log('Create Concept failed (expected if Neo4j not running):', e.message);
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTests();
