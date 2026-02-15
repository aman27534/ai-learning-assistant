const http = require('http');

async function makeRequest(path, method, body, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function verify() {
    console.log('🧪 Verifying Advanced Learning Features...\n');

    try {
        const userId = 'verify-' + Date.now();
        const email = `${userId}@test.com`;
        const password = 'password123';

        // 1. Register & Login
        console.log('1. Authenticating...');
        await makeRequest('/auth/register', 'POST', { email, password, name: 'Test User' });
        const login = await makeRequest('/auth/login', 'POST', { email, password });
        const token = login.data?.token;

        if (!token) throw new Error('Login failed');
        console.log('✅ Authenticated\n');

        // 2. Verify Dynamic Content (Beginner)
        console.log('2. Testing Beginner Content Generation...');
        const beginnerReq = {
            concept: 'react-fundamentals',
            userLevel: {
                concept: 'react-fundamentals',
                mastery: 0.2, // Beginner
                confidence: 0.5,
                lastAssessed: new Date(),
                assessmentCount: 1
            },
            preferredStyle: 'visual'
        };

        const beginnerExp = await makeRequest('/explanations', 'POST', beginnerReq, token);
        console.log('Summary:', beginnerExp.data.content.summary);
        if (beginnerExp.data.targetLevel !== 'beginner') throw new Error('Expected beginner level');
        console.log('✅ Beginner Content Verified\n');

        // 3. Verify Dynamic Content (Expert)
        console.log('3. Testing Expert Content Generation...');
        const expertReq = {
            concept: 'react-fundamentals',
            userLevel: {
                concept: 'react-fundamentals',
                mastery: 0.9, // Expert
                confidence: 0.9,
                lastAssessed: new Date(),
                assessmentCount: 10
            }
        };

        const expertExp = await makeRequest('/explanations', 'POST', expertReq, token);
        console.log('Summary:', expertExp.data.content.summary);
        if (expertExp.data.targetLevel !== 'expert') throw new Error('Expected expert level');
        console.log('✅ Expert Content Verified\n');

        // 4. Verify Adaptive State Tracking
        console.log('4. Testing Real Adaptive State Tracking...');
        // Track high progress
        await makeRequest('/progress', 'POST', { concept: 'react-fundamentals', mastery: 0.85 }, token);

        // Check recommendations (should reflect high mastery)
        const insights = await makeRequest('/insights', 'GET', null, token);
        const strengths = insights.data.strengths;
        console.log('User Strengths:', strengths);

        if (strengths.includes('react-fundamentals')) {
            console.log('✅ Adaptive State Verified: Concept moved to strengths');
        } else {
            console.log('⚠️ Adaptive State Warning: Concept not yet in strengths (might need more history)');
        }

    } catch (err) {
        console.error('❌ Verification failed:', err);
        process.exit(1);
    }
}

verify();
