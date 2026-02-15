# 🚀 Quick Start Guide

## Fastest Way to Get Started

### Option 1: Windows Batch File (Easiest)

```cmd
# Double-click or run in Command Prompt
run.bat
```

### Option 2: PowerShell Script

```powershell
# Right-click -> "Run with PowerShell" or:
./run.ps1
```

### Option 3: Manual Setup

```bash
# 1. Setup everything
node setup.js

# 2. Start development server
node dev.js

# 3. Or build and start production
node build.js
node start.js
```

## What Each Script Does

### `run.bat` / `run.ps1`

- ✅ Checks Node.js installation
- 📦 Sets up project if needed
- 🔨 Builds if needed
- 🎯 Gives you menu options

### `setup.js`

- 📁 Creates necessary directories
- 📄 Creates .env file
- 📦 Installs dependencies
- 🔨 Builds the project

### `dev.js`

- 🔧 Starts development server with hot reload
- 🔄 Uses ts-node for TypeScript
- 📊 Available at http://localhost:3001

### `build.js`

- 🔨 Compiles TypeScript to JavaScript
- 📁 Outputs to `dist/` directory
- ✅ Ready for production

### `start.js`

- 🚀 Starts production server
- 📊 Uses compiled JavaScript
- ⚡ Faster startup than dev mode

## Troubleshooting

### If you get "npm not found"

- ✅ Scripts work without npm!
- 📦 They use Node.js directly
- 🔧 Install Node.js from https://nodejs.org

### If you get permission errors

- 🔑 Run as Administrator (Windows)
- 📝 Or use PowerShell as Administrator

### If build fails

- 🧹 Delete `node_modules` and `dist` folders
- 🔄 Run `node setup.js` again

## Quick Commands

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Start learning session (need auth token)
curl -X POST http://localhost:3001/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic":"javascript-basics"}'
```

## File Structure After Setup

```
services/learning-svc/
├── 📁 dist/              # Compiled JavaScript
├── 📁 src/               # TypeScript source
├── 📁 node_modules/      # Dependencies
├── 📁 logs/              # Log files
├── 📁 coverage/          # Test coverage
├── 📄 .env               # Environment variables
├── 🚀 run.bat            # Windows quick start
├── 🚀 run.ps1            # PowerShell quick start
└── 📚 README.md          # Full documentation
```

## Next Steps

1. 🔧 **Customize**: Edit `.env` file for your settings
2. 🧪 **Test**: Run tests with `npm test` or `npx jest`
3. 📚 **Learn**: Read the full README.md
4. 🐛 **Debug**: Check TROUBLESHOOTING.md if issues arise
5. 🚀 **Deploy**: Use Docker or deploy `dist/` folder

## Support

- 📚 **Full docs**: README.md
- 🐛 **Issues**: TROUBLESHOOTING.md
- 🔧 **Config**: Check tsconfig.json, jest.config.js
- 📊 **Health**: http://localhost:3001/health
