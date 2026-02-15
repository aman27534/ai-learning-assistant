#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Learning Service in Development Mode...');

// Check if ts-node is available
try {
  require.resolve('ts-node');
} catch (error) {
  console.log('📦 Installing ts-node...');
  const { execSync } = require('child_process');
  execSync('npm install ts-node', { stdio: 'inherit' });
}

// Start development server with ts-node
const srcFile = path.join(__dirname, 'src', 'index.ts');

console.log('🔄 Starting development server...');
const server = spawn('npx', ['ts-node', srcFile], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: process.env.PORT || '3001',
    TS_NODE_PROJECT: path.join(__dirname, 'tsconfig.json')
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start development server:', error.message);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🛑 Development server stopped with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill('SIGTERM');
});