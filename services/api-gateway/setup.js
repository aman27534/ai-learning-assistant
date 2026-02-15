#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up API Gateway...');

try {
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found');
    process.exit(1);
  }

  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔨 Building TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });

  console.log('✅ API Gateway setup complete!');
  console.log('');
  console.log('🚀 To start the API Gateway:');
  console.log('   npm run dev    (development)');
  console.log('   npm start      (production)');
  console.log('');
  console.log('📍 API Gateway will run on: http://localhost:3000');
  console.log('🔗 General Task Execution: http://localhost:3000/general-task-execution');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}