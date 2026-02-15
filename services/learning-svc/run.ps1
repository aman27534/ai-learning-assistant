# Learning Service - PowerShell Runner
Write-Host "🚀 Learning Service - Quick Start" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the learning-svc directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Setup if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Setting up for first time..." -ForegroundColor Yellow
    node setup.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Setup failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Build if needed
if (-not (Test-Path "dist")) {
    Write-Host "🔨 Building project..." -ForegroundColor Yellow
    node build.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "🎯 Choose an option:" -ForegroundColor Cyan
Write-Host "1. Start development server (with hot reload)" -ForegroundColor White
Write-Host "2. Start production server" -ForegroundColor White
Write-Host "3. Run tests" -ForegroundColor White
Write-Host "4. Build project" -ForegroundColor White
Write-Host "5. Setup/Reset project" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "🔧 Starting development server..." -ForegroundColor Green
        node dev.js
    }
    "2" {
        Write-Host "🚀 Starting production server..." -ForegroundColor Green
        node start.js
    }
    "3" {
        Write-Host "🧪 Running tests..." -ForegroundColor Green
        if (Get-Command npm -ErrorAction SilentlyContinue) {
            npm test
        } else {
            npx jest
        }
    }
    "4" {
        Write-Host "🔨 Building project..." -ForegroundColor Green
        node build.js
    }
    "5" {
        Write-Host "🔄 Setting up project..." -ForegroundColor Green
        node setup.js
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Read-Host "Press Enter to exit"