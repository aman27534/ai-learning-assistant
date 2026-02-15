@echo off
echo 🚀 Learning Service - Quick Start
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check if package.json exists
if not exist package.json (
    echo ❌ package.json not found
    echo Please run this script from the learning-svc directory
    pause
    exit /b 1
)

REM Setup if needed
if not exist node_modules (
    echo 📦 Setting up for first time...
    node setup.js
    if errorlevel 1 (
        echo ❌ Setup failed
        pause
        exit /b 1
    )
)

REM Build if needed
if not exist dist (
    echo 🔨 Building project...
    node build.js
    if errorlevel 1 (
        echo ❌ Build failed
        pause
        exit /b 1
    )
)

echo.
echo 🎯 Choose an option:
echo 1. Start development server (with hot reload)
echo 2. Start production server
echo 3. Run tests
echo 4. Build project
echo 5. Setup/Reset project
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo 🔧 Starting development server...
    node dev.js
) else if "%choice%"=="2" (
    echo 🚀 Starting production server...
    node start.js
) else if "%choice%"=="3" (
    echo 🧪 Running tests...
    npm test
) else if "%choice%"=="4" (
    echo 🔨 Building project...
    node build.js
) else if "%choice%"=="5" (
    echo 🔄 Setting up project...
    node setup.js
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
)

pause