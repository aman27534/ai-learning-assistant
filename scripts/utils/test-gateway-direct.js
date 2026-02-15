
const http = require('http');

async function testGatewayDirect() {
    console.log('--- Testing Gateway Direct (Port 3000) - Invalid Path ---');
    const API_URL = 'http://localhost:3000/api/learning';

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

        if (text.includes('Cannot POST')) {
            console.log('✅ RESPONSE FROM LEARNING SERVICE (Expected)');
        } else if (text.includes('availableRoutes')) {
            console.log('❌ RESPONSE FROM GATEWAY (Proxy skipped!)');
        }

    } catch (e) {
        console.error('❌ Error hitting Gateway:', e.message);
    }
}

testGatewayDirect();
