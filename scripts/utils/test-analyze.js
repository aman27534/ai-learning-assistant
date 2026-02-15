const http = require('http');

const data = JSON.stringify({
    code: "console.log('hello')",
    language: "javascript"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/productivity/analyze',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🧪 Testing Analysis Endpoint via Gateway...');

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => body += chunk);

    res.on('end', () => {
        console.log('Response Body:', body);
        try {
            const json = JSON.parse(body);
            if (json.status === 'success') {
                console.log('✅ SUCCESS: Analysis feature is working!');
            } else {
                console.log('❌ FAILURE: Unexpected response format');
            }
        } catch (e) {
            console.log('❌ FAILURE: Invalid JSON response');
        }
    });
});

req.on('error', (error) => {
    console.error(`❌ ERROR: ${error.message}`);
});

req.write(data);
req.end();
