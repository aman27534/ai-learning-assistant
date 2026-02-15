#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Learning Service...');

// Check if dist directory exists
const distDir = path.join(__dirname, 'dist');
const indexFile = path.join(distDir, 'index.js');

if (!fs.existsSync(indexFile)) {
  console.log('📦 Building project first...');
  require('./build.js');
}

// Start the service
console.log('🔄 Starting server...');
const server = spawn('node', [indexFile], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3001'
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🛑 Server stopped with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.kill('SIGTERM');
});