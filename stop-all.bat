@echo off
echo 🛑 Stopping all Node.js and related processes...
taskkill /F /IM node.exe
taskkill /F /IM cmd.exe
echo.
echo ✅ Cleanup complete. All old servers are stopped.
echo.
echo 👉 You can now run "npm run dev" or "start-dev.bat" cleanly.
pause
