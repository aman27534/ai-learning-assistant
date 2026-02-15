
async function testAuth() {
    console.log('--- Testing Auth Flow ---');

    // Test 1: Direct to Learning Service
    console.log('\n[Test 1] Direct to Learning Service (Port 3001)');
    try {
        const directRes = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'demo@user.com', password: 'DemoPass123!' })
        });
        console.log(`Direct Login Status: ${directRes.status}`);
        const text = await directRes.text();
        console.log(`Direct Login Response: ${text.substring(0, 100)}...`);
    } catch (e) {
        console.error('Direct Login Error:', e.message);
    }

    // Test 2: Via Gateway
    console.log('\n[Test 2] Via API Gateway (Port 3000)');
    const API_URL = 'http://localhost:3000';
    try {
        const loginRes = await fetch(`${API_URL}/api/learning/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'demo@user.com', password: 'DemoPass123!' })
        });

        console.log(`Gateway Login Status: ${loginRes.status}`);
        if (loginRes.ok) {
            console.log('Gateway Login Success!');
        } else {
            const txt = await loginRes.text();
            console.log('Gateway Login Failed:', txt.substring(0, 100));
        }
    } catch (e) {
        console.error('Gateway Login Error:', e.message);
    }
}

testAuth();
