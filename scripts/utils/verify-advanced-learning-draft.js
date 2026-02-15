const http = require('http');

async function makeRequest(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001, // Direct to Learning Service to isolate tests
            path,
            method,
            headers: {
                'Content-Type': 'application/json'
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
        // 1. Verify Dynamic Content Generation
        console.log('1. Testing Content Generation (should vary by level)...');

        // Register temporary user
        const userId = 'verify-user-' + Date.now();
        await makeRequest('/auth/register', 'POST', {
            email: `${userId}@test.com`,
            password: 'password123',
            name: 'Test User'
        });
        const login = await makeRequest('/auth/login', 'POST', {
            email: `${userId}@test.com`,
            password: 'password123'
        });
        const token = login.token;

        // Get explanation (Beginner)
        // Note: We need to set skill level first or just rely on default
        // We'll mock the internal call via exposure if possible, but here we test public API
        // Actually, we can just request an explanation if the endpoint exists.
        // Looking at `learning-service.ts`, `generateExplanation` is internal but used by `getConceptExplanation`

        // Wait, `getConceptExplanation` is a method on `LearningService`, but is it exposed via API?
        // I need to check `index.ts` (routes) of `learning-service`.
        // Assuming standard routes:

        // Let's try to start a session to trigger content generation implicitly or check if there is an explanation endpoint.
        // Based on previous context, `POST /learning/explanations` might exist.

    } catch (err) {
        console.error('Setup failed:', err);
    }
}

// Since I can't easily see the routes without reading file, and I want to be efficient:
// I'll read the routes file first to ensure I hit the right endpoints.
