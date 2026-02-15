const http = require('http');

async function request(port, path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port,
            path,
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    console.log('🔍 Verifying Service Upgrades...');

    // 1. Content Service
    console.log('\n📚 Content Service:');
    const material = await request(3004, '/materials', 'POST', {
        title: 'New Dynamic Content', type: 'video', url: 'http://test.com'
    });
    console.log('Add Material:', material.success ? '✅ Success' : '❌ Failed');
    const list = await request(3004, '/materials');
    console.log('List count:', list.data.length, list.data.find(m => m.title === 'New Dynamic Content') ? '✅ Found' : '❌ Not Found');

    // 2. Analytics Service
    console.log('\n📊 Analytics Service:');
    await request(3005, '/events', 'POST', { type: 'test_event' });
    const dashboard = await request(3005, '/dashboard');
    console.log('Dashboard active:', dashboard.success ? '✅ Success' : '❌ Failed');
    console.log('Events tracked:', dashboard.data.recentEvents.length > 0 ? '✅ Yes' : '❌ No');

    // 3. Knowledge Service (Fallback)
    console.log('\n🧠 Knowledge Graph (Fallback):');
    const concept = await request(3003, '/concepts', 'POST', {
        name: 'FallbackNode', description: 'Testing memory store', type: 'Test'
    });
    console.log('Create Concept:', concept.success ? '✅ Success' : '❌ Failed', concept.data?.id ? '(ID Generated)' : '');

    // 4. Productivity Service
    console.log('\n⚡ Productivity Service:');
    const explanation = await request(3002, '/explain', 'POST', {
        code: 'function hello() { console.log("world"); }'
    });
    console.log('Explain Code:', explanation.success ? '✅ Success' : '❌ Failed');
    console.log('Output:', explanation.data.explanation.includes('Code Analysis Summary') ? '✅ Correct Format' : '❌ Unexpected Format');
}

run();
