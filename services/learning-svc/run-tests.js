#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 Running Learning Service Tests...');

// Use Jest's main JavaScript file directly
const jestPath = path.join(__dirname, 'node_modules', 'jest', 'bin', 'jest.js');

if (!fs.existsSync(jestPath)) {
  console.error('❌ Jest executable not found at:', jestPath);
  process.exit(1);
}

const jestConfig = path.join(__dirname, 'jest.config.js');

const args = [
  jestPath,
  '--config', jestConfig,
  '--passWithNoTests',
  '--detectOpenHandles',
  '--forceExit'
];

// Add any command line arguments
if (process.argv.includes('--watch')) {
  args.push('--watch');
}

if (process.argv.includes('--coverage')) {
  args.push('--coverage');
}

if (process.argv.includes('--verbose')) {
  args.push('--verbose');
}

console.log('🔄 Starting Jest...');
console.log(`📍 Using Jest at: ${jestPath}`);

// Use node to run Jest directly
const jest = spawn('node', args, {
  stdio: 'inherit',
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'test'
  }
});

jest.on('error', (error) => {
  console.error('❌ Failed to run tests:', error.message);
  process.exit(1);
});

jest.on('close', (code) => {
  if (code === 0) {
    console.log('✅ All tests passed!');
  } else {
    console.log(`❌ Tests failed with code ${code}`);
  }
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping tests...');
  jest.kill('SIGINT');
});