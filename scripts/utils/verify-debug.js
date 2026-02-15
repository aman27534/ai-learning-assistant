const http = require('http');
const fs = require('fs');

function log(msg) {
    console.log(msg);
    fs.appendFileSync('verify-log.txt', msg + '\n');
}

async function makeRequest(path, method, body, token) {
    return new Promise((resolve, reject) => {
        log(`[REQUEST] ${method} ${path}`);
        if (body) log(`[BODY] ${JSON.stringify(body)}`);

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
                log(`[RESPONSE] ${res.statusCode} ${data.substring(0, 200)}...`);
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        });

        req.on('error', (err) => {
            log(`[ERROR] ${err.message}`);
            reject(err);
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function verify() {
    log('🧪 Verifying Advanced Learning Features (Debug Mode)...\n');

    try {
        const userId = 'verify-' + Date.now();
        const email = `${userId}@test.com`;
        const password = 'Password@123'; // Meets all requirements: Upper, lower, number, special

        // 1. Register & Login
        log('1. Authenticating...');
        const reg = await makeRequest('/auth/register', 'POST', { email, password, name: 'Test User' });

        if (reg.status !== 200) {
            log(`Registration failed/skipped: ${JSON.stringify(reg.data)}`);
        }

        const login = await makeRequest('/auth/login', 'POST', { email, password });
        if (login.status !== 200) {
            throw new Error(`Login failed: ${JSON.stringify(login.data)}`);
        }

        const token = login.data.data?.tokens?.accessToken;

        if (!token) {
            log(`Login response structure: ${JSON.stringify(login.data)}`);
            throw new Error('No token received');
        }
        log('✅ Authenticated\n');

        // 2. Verify Dynamic Content
        log('2. Testing Content Generation...');
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
        log(`Beginner Explanation: ${beginnerExp.data.data?.content?.summary}`);

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
        log(`Expert Explanation: ${expertExp.data.data?.content?.summary}`);

        if (beginnerExp.data.data.content.summary === expertExp.data.data.content.summary) {
            log('WARNING: Content seems identical!');
        } else {
            log('✅ Content Variation Verified');
        }

        // 4. Verify Adaptive State Tracking
        log('4. Testing Real Adaptive State Tracking...');
        await makeRequest('/progress', 'POST', { concept: 'react-fundamentals', mastery: 0.85 }, token);

        const insights = await makeRequest('/insights', 'GET', null, token);
        log(`Insights: ${JSON.stringify(insights.data.data)}`);

    } catch (err) {
        log(`❌ Verification failed: ${err.message}`);
        process.exit(1);
    }
}

verify();
