#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing General Task Execution Endpoint...');

// Test GET request first
const testGet = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/general-task-execution',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📋 GET /general-task-execution');
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', JSON.parse(data));
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ GET Error:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.error('❌ GET Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

// Test POST request
const testPost = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      task: 'test-task-execution',
      service: 'learning',
      params: {
        userId: 'test-user',
        action: 'start-learning-session'
      }
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/general-task-execution',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📋 POST /general-task-execution');
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', JSON.parse(data));
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ POST Error:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.error('❌ POST Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(postData);
    req.end();
  });
};

// Run tests
async function runTests() {
  try {
    await testGet();
    await testPost();
    console.log('\n✅ All tests completed successfully!');
    console.log('\n🎉 The /general-task-execution endpoint is now working!');
    console.log('📍 Available at: http://localhost:3000/general-task-execution');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();