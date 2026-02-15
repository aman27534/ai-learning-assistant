
const http = require('http');

async function testFrontendProxy() {
    console.log('--- Testing Frontend Proxy (Port 3100) - Invalid Path ---');
    const API_URL = 'http://localhost:3100/api/learning';

    console.log(`\nAttempting HIT to /auth/garbage...`);
    try {
        const response = await fetch(`${API_URL}/auth/garbage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ foo: 'bar' })
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log('Response:', text.substring(0, 100));

    } catch (e) {
        console.error('❌ Error hitting Frontend:', e.message);
    }
}

testFrontendProxy();
