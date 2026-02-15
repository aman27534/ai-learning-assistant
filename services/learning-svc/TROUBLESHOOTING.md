# Troubleshooting Guide

## Common Issues and Solutions

### 1. npm command not found

**Problem:** `npm : The term 'npm' is not recognized`

**Solutions:**

```bash
# Option 1: Use Node.js directly
node setup.js

# Option 2: Install Node.js from https://nodejs.org
# Then restart your terminal

# Option 3: Use alternative package managers
yarn install  # if you have yarn
pnpm install  # if you have pnpm
```

### 2. TypeScript compilation errors

**Problem:** `error TS2307: Cannot find module`

**Solutions:**

```bash
# Clean and rebuild
node build.js

# Or manually install TypeScript
npm install typescript
npx tsc
```

### 3. Missing dependencies

**Problem:** `Cannot find module 'express'`

**Solutions:**

```bash
# Install core dependencies manually
npm install express cors helmet bcryptjs jsonwebtoken winston

# Install dev dependencies
npm install --save-dev typescript ts-node jest ts-jest @types/node
```

### 4. Port already in use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions:**

```bash
# Use different port
set PORT=3002 && node start.js

# Or kill process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

### 5. Permission errors

**Problem:** `EACCES: permission denied`

**Solutions:**

```bash
# Run as administrator (Windows)
# Right-click terminal -> "Run as administrator"

# Or change npm permissions
npm config set prefix %APPDATA%\npm
```

### 6. Build failures

**Problem:** Build script fails

**Solutions:**

```bash
# Manual build process
npx tsc --build
# or
.\node_modules\.bin\tsc

# Check TypeScript config
npx tsc --showConfig
```

### 7. Test failures

**Problem:** Jest tests fail to run

**Solutions:**

```bash
# Install test dependencies
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest

# Run tests with verbose output
npx jest --verbose

# Clear Jest cache
npx jest --clearCache
```

### 8. Import/Export errors

**Problem:** `Cannot use import statement outside a module`

**Solutions:**

- Ensure `tsconfig.json` has correct module settings
- Use `.ts` extensions for TypeScript files
- Check that `ts-node` is properly configured

### 9. Environment variables not loading

**Problem:** Environment variables undefined

**Solutions:**

```bash
# Create .env file
copy .env.example .env

# Or set manually
set NODE_ENV=development
set PORT=3001
set JWT_SECRET=your-secret-key
```

### 10. Database connection issues

**Problem:** Cannot connect to database

**Solutions:**

- Check if database service is running
- Verify connection string in .env
- Ensure database exists and user has permissions

## Quick Fixes

### Reset everything

```bash
# Delete node_modules and reinstall
rmdir /s node_modules
del package-lock.json
npm install
```

### Clean build

```bash
# Remove build artifacts
rmdir /s dist
rmdir /s coverage
node build.js
```

### Verify installation

```bash
# Check versions
node --version
npm --version
npx tsc --version
```

## Getting Help

1. **Check logs:** Look in `logs/` directory for detailed error messages
2. **Enable debug mode:** Set `LOG_LEVEL=debug` in .env
3. **Run health check:** Visit `http://localhost:3001/health`
4. **Check dependencies:** Run `npm list` to see installed packages

## Manual Setup (if scripts fail)

```bash
# 1. Install dependencies
npm install express cors helmet bcryptjs jsonwebtoken winston
npm install --save-dev typescript ts-node jest ts-jest @types/node @types/express

# 2. Create directories
mkdir dist logs coverage

# 3. Compile TypeScript
npx tsc

# 4. Start server
node dist/index.js
```

## Environment Setup

### Windows PowerShell

```powershell
# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Set environment variables
$env:NODE_ENV="development"
$env:PORT="3001"
```

### Command Prompt

```cmd
set NODE_ENV=development
set PORT=3001
node start.js
```

### Git Bash / WSL

```bash
export NODE_ENV=development
export PORT=3001
node start.js
```

## Performance Issues

### Slow startup

- Check antivirus software (exclude node_modules)
- Use SSD for better I/O performance
- Close unnecessary applications

### Memory issues

- Increase Node.js memory limit: `node --max-old-space-size=4096 start.js`
- Monitor memory usage with Task Manager

## Security Considerations

1. **Change default secrets** in .env file
2. **Use HTTPS** in production
3. **Keep dependencies updated**: `npm audit fix`
4. **Validate all inputs** before processing

## Still Having Issues?

1. Check the main README.md for additional information
2. Look at the API documentation
3. Review the source code comments
4. Create an issue with detailed error messages and system information
