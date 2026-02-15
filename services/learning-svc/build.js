#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Learning Service...');

try {
  // Check if TypeScript is available
  try {
    execSync('npx tsc --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('📦 Installing TypeScript...');
    execSync('npm install typescript', { stdio: 'inherit' });
  }

  // Clean dist directory
  const distDir = path.join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  // Compile TypeScript
  console.log('🔄 Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
  console.log('📁 Output directory: ./dist');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}