@echo off
echo Starting AI Learning Assistant Services...

:: Start API Gateway
echo Starting API Gateway...
start "API Gateway" cmd /k "cd services/api-gateway && npx ts-node src/index.ts"

:: Start Learning Service
echo Starting Learning Service...
start "Learning Service" cmd /k "cd services/learning-svc && npx ts-node src/index.ts"

echo Starting Productivity Service...
start "Productivity Service" cmd /k "cd services/productivity-svc && npx ts-node src/index.ts"

:: Start Content Service
echo Starting Content Service...
start "Content Service" cmd /k "cd services/content-svc && npx ts-node src/index.ts"

:: Start Analytics Service
echo Starting Analytics Service...
start "Analytics Service" cmd /k "cd services/analytics-svc && npx ts-node src/index.ts"

:: Start Frontend
echo Starting Frontend...
start "Frontend" cmd /k "cd web && npm run dev"

echo.
echo ===================================================
echo All services have been launched in separate windows!
echo.
echo Wait a moment for them to initialize, then visit:
echo http://localhost:3100
echo ===================================================
pause
