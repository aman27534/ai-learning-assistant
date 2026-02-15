#!/usr/bin/env node

const http = require('http');

console.log('🔍 Checking All Services Status...');
console.log('=====================================');

const services = [
  { name: 'API Gateway', url: 'http://localhost:3000/health' },
  { name: 'Learning Service', url: 'http://localhost:3001/health' },
  { name: 'Productivity Service', url: 'http://localhost:3002/health' },
  { name: 'Knowledge Graph Service', url: 'http://localhost:3003/health' },
  { name: 'Content Service', url: 'http://localhost:3004/health' },
  { name: 'Analytics Service', url: 'http://localhost:3005/health' },
  { name: 'General Task Execution', url: 'http://localhost:3000/general-task-execution' },
  { name: 'Web Frontend', url: 'http://localhost:3100' }
];

async function checkService(service) {
  return new Promise((resolve) => {
    const url = new URL(service.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ ${service.name}: HEALTHY (${res.statusCode})`);
          if (response.message) {
            console.log(`   📝 ${response.message}`);
          }
          resolve({ name: service.name, status: 'healthy', code: res.statusCode });
        } catch (error) {
          console.log(`⚠️  ${service.name}: RESPONDING (${res.statusCode}) - Non-JSON response`);
          resolve({ name: service.name, status: 'responding', code: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${service.name}: UNAVAILABLE - ${error.message}`);
      resolve({ name: service.name, status: 'unavailable', error: error.message });
    });

    req.on('timeout', () => {
      console.log(`⏰ ${service.name}: TIMEOUT`);
      req.destroy();
      resolve({ name: service.name, status: 'timeout' });
    });

    req.end();
  });
}

async function checkAllServices() {
  const results = [];

  for (const service of services) {
    const result = await checkService(service);
    results.push(result);
    console.log(''); // Add spacing
  }

  console.log('=====================================');
  console.log('📊 SUMMARY:');

  const healthy = results.filter(r => r.status === 'healthy').length;
  const total = results.length;

  console.log(`✅ Healthy Services: ${healthy}/${total}`);

  if (healthy === total) {
    console.log('🎉 All services are running properly!');
    console.log('');
    console.log('🔗 Available Endpoints:');
    console.log('   API Gateway: http://localhost:3000');
    console.log('   Learning Service: http://localhost:3001');
    console.log('   Learning Service: http://localhost:3001');
    console.log('   Productivity Service: http://localhost:3002');
    console.log('   Knowledge Graph Service: http://localhost:3003');
    console.log('   Content Service: http://localhost:3004');
    console.log('   Analytics Service: http://localhost:3005');
    console.log('   General Task Execution: http://localhost:3000/general-task-execution');
  } else {
    console.log('⚠️  Some services may need attention.');
  }

  const fs = require('fs');
  fs.writeFileSync('status.json', JSON.stringify(results, null, 2));
  console.log('Status saved to status.json');
}

checkAllServices().catch(console.error);