
const API_URL = 'http://localhost:3000/api/learning';
const EMAIL = 'demo@user.com';
const PASSWORD = 'DemoPass123!';

async function testChat() {
    console.log('--- Testing AI Assistant Logic (Verbose) ---');

    async function safeFetch(url, options) {
        console.log(`fetching: ${url}`);
        try {
            const res = await fetch(url, options);
            console.log(`status: ${res.status}`);
            const text = await res.text();
            console.log('response text:', text.substring(0, 100)); // limit log
            try {
                return JSON.parse(text);
            } catch (e) {
                console.log('JSON Parse Failed. Raw Response:', text);
                return { success: false, error: 'Invalid JSON response' };
            }
        } catch (e) {
            console.log(`Fetch Error: ${e.message}`);
            return { success: false, error: e.message };
        }
    }

    // 1. Login
    console.log('Logging in...');
    const loginData = await safeFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });

    if (!loginData.success || !loginData.data) {
        console.error('Login failed, cannot proceed.', loginData);
        return;
    }
    const token = loginData.data.tokens.accessToken;
    console.log('✅ Token received');

    // 2. Chat
    async function sendChat(message) {
        console.log(`\nUser: "${message}"`);
        const chatData = await safeFetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });

        if (chatData.success) {
            console.log(`AI:   "${chatData.data.message}"`);
        } else {
            console.log(`Error: ${chatData.error}`);
        }
    }

    await sendChat("Hello");
    await sendChat("Explain React");
}

testChat().catch(e => console.error("Script Crashed:", e));
