#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Learning Service...');

function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
  return true;
}

function createDirectories() {
  const dirs = [
    'dist',
    'coverage',
    'logs',
    'src/test',
    'src/__tests__',
    'src/learning/__tests__'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    console.error('❌ Node.js version 16 or higher is required');
    console.error(`   Current version: ${nodeVersion}`);
    return false;
  }
  
  console.log(`✅ Node.js version: ${nodeVersion}`);
  return true;
}

function createEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    const envContent = `# Learning Service Environment Variables
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
LOG_LEVEL=debug

# Database (when implemented)
# DATABASE_URL=postgresql://user:password@localhost:5432/learning_db
# REDIS_URL=redis://localhost:6379
`;
    fs.writeFileSync(envPath, envContent);
    console.log('📄 Created .env file');
  }
}

async function main() {
  console.log('🔍 Checking prerequisites...');
  
  if (!checkNodeVersion()) {
    process.exit(1);
  }

  console.log('📁 Creating directories...');
  createDirectories();

  console.log('📄 Setting up configuration files...');
  createEnvFile();

  console.log('📦 Installing dependencies...');
  if (!runCommand('npm install', 'Installing dependencies')) {
    console.log('⚠️  If npm install fails, you can install dependencies manually:');
    console.log('   npm install express cors helmet bcryptjs jsonwebtoken winston');
    console.log('   npm install --save-dev typescript ts-node jest ts-jest @types/node');
  }

  console.log('🔨 Building project...');
  if (!runCommand('node build.js', 'Building TypeScript')) {
    console.log('⚠️  Build failed, but you can try running it manually later');
  }

  console.log('\n🎉 Setup completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Review and update .env file with your configuration');
  console.log('   2. Start development server: node dev.js');
  console.log('   3. Or build and start: node build.js && node start.js');
  console.log('   4. Run tests: npm test');
  console.log('\n🌐 The service will be available at: http://localhost:3001');
  console.log('📊 Health check endpoint: http://localhost:3001/health');
}

main().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});