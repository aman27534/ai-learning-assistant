#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Test Configuration...');
console.log('=====================================');

// Check if required files exist
const requiredFiles = [
  'jest.config.js',
  'src/test/setup.ts',
  'src/__tests__/api.test.ts',
  'src/learning/__tests__/learning-service.test.ts',
  'tsconfig.json',
  'package.json'
];

console.log('\n📁 Required Files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check Jest configuration
console.log('\n⚙️  Jest Configuration:');
try {
  const jestConfig = require('./jest.config.js');
  console.log('  ✅ Jest config loaded successfully');
  console.log(`  📝 Test environment: ${jestConfig.testEnvironment}`);
  console.log(`  📝 Preset: ${jestConfig.preset}`);
  console.log(`  📝 Timeout: ${jestConfig.testTimeout}ms`);
} catch (error) {
  console.log('  ❌ Jest config error:', error.message);
}

// Check TypeScript configuration
console.log('\n📝 TypeScript Configuration:');
try {
  const tsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.json'), 'utf8'));
  console.log('  ✅ TypeScript config loaded successfully');
  console.log(`  📝 Target: ${tsConfig.compilerOptions.target}`);
  console.log(`  📝 Module: ${tsConfig.compilerOptions.module}`);
  console.log(`  📝 Strict: ${tsConfig.compilerOptions.strict}`);
} catch (error) {
  console.log('  ❌ TypeScript config error:', error.message);
}

// Check dependencies
console.log('\n📦 Test Dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const testDeps = [
    'jest',
    'ts-jest',
    '@types/jest',
    'supertest',
    '@types/supertest',
    'fast-check'
  ];
  
  testDeps.forEach(dep => {
    const hasDevDep = packageJson.devDependencies && packageJson.devDependencies[dep];
    const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`  ${hasDevDep || hasDep ? '✅' : '❌'} ${dep}`);
  });
} catch (error) {
  console.log('  ❌ Package.json error:', error.message);
}

// Check test files structure
console.log('\n🧪 Test Files Structure:');
const testDirs = [
  'src/__tests__',
  'src/learning/__tests__',
  'src/test'
];

testDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  ✅ ${dir}/`);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.ts'));
    files.forEach(file => {
      console.log(`    📄 ${file}`);
    });
  } else {
    console.log(`  ❌ ${dir}/ (missing)`);
  }
});

console.log('\n=====================================');
console.log('✅ Test configuration check complete!');
console.log('\n💡 To run tests:');
console.log('   node run-tests.js');
console.log('   node run-tests.js --coverage');
console.log('   node run-tests.js --watch');