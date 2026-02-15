process.env.NODE_ENV = 'test';
console.log('Starting debug import...');
try {
    const mod = require('./src/index');
    console.log('Import successful');
} catch (e) {
    console.error('Import failed:', e);
}
