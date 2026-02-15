
async function testAuthFlow() {
    console.log('--- Testing Frontend Auth Flow (Robustness) ---');
    const email = 'demo@user.com';
    const password = 'DemoPass123!';
    const API_URL = 'http://localhost:3000/api/learning';

    console.log(`\n1. Attempting Login for ${email}...`);
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (loginRes.ok) {
            console.log('✅ Login Successful!');
        } else {
            console.log(`❌ Login Failed (${loginRes.status})`);
        }
    } catch (e) {
        console.error('❌ Login Error:', e.message);
    }

    // Force try registration even if login succeeded, to see what happens
    console.log(`\n2. Attempting Registration for ${email} (Expecting Failure if user exists)...`);
    try {
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (regRes.ok) {
            console.log('✅ Registration Successful (Unexpected if user exists!)');
        } else {
            const txt = await regRes.text();
            console.log(`❌ Registration Failed (${regRes.status}):`, txt);
        }
    } catch (e) {
        console.error('❌ Registration Error:', e.message);
    }
}

testAuthFlow();
