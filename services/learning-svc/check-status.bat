@echo off
cls
echo ================================================================================
echo                    LEARNING SERVICE - SETUP STATUS CHECKER
echo ================================================================================
echo.

echo 📊 CHECKING SETUP STATUS...
echo.

REM Check Node.js
echo 🔍 Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js NOT FOUND - Please install from https://nodejs.org
    echo.
) else (
    echo ✅ Node.js FOUND: 
    node --version
    echo.
)

REM Check core files
echo 🔍 Checking core files...
if exist package.json (
    echo ✅ package.json - EXISTS
) else (
    echo ❌ package.json - MISSING
)

if exist src\index.ts (
    echo ✅ src\index.ts - EXISTS
) else (
    echo ❌ src\index.ts - MISSING
)

if exist tsconfig.json (
    echo ✅ tsconfig.json - EXISTS
) else (
    echo ❌ tsconfig.json - MISSING
)

echo.

REM Check setup status
echo 🔍 Checking setup completion...
if exist node_modules (
    echo ✅ node_modules\ - DEPENDENCIES INSTALLED
) else (
    echo ❌ node_modules\ - DEPENDENCIES NOT INSTALLED
)

if exist dist (
    echo ✅ dist\ - PROJECT BUILT
) else (
    echo ❌ dist\ - PROJECT NOT BUILT
)

if exist .env (
    echo ✅ .env - ENVIRONMENT CONFIGURED
) else (
    echo ❌ .env - ENVIRONMENT NOT CONFIGURED
)

echo.
echo ================================================================================

REM Calculate status
set /a completed=0
if exist package.json set /a completed+=1
if exist src\index.ts set /a completed+=1
if exist tsconfig.json set /a completed+=1
if exist node_modules set /a completed+=1
if exist dist set /a completed+=1
if exist .env set /a completed+=1

if %completed% geq 6 (
    echo 🎉 STATUS: SETUP COMPLETE (%completed%/6 items)
    echo ✅ Ready to run! Try: node start.js
) else if %completed% geq 3 (
    echo ⚠️  STATUS: PARTIAL SETUP (%completed%/6 items)
    echo 🔧 Need to run setup. Try: node setup.js
) else (
    echo ❌ STATUS: SETUP NEEDED (%completed%/6 items)
    echo 🚀 Run setup first: node setup.js
)

echo.
echo ================================================================================
echo 🚀 NEXT STEPS:
echo.
if not exist node_modules (
    echo 1. Run setup: node setup.js
    echo 2. Start server: node dev.js
) else if not exist dist (
    echo 1. Build project: node build.js
    echo 2. Start server: node start.js
) else (
    echo 1. Start development: node dev.js
    echo 2. Or production: node start.js
    echo 3. Test health: http://localhost:3001/health
)
echo.
echo 📚 For help: open QUICK-START.md or TROUBLESHOOTING.md
echo ================================================================================
echo.
pause