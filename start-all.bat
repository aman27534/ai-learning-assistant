@echo off
echo Starting AI Learning Assistant Services...

start "API Gateway" /D "services\api-gateway" npm start
start "Learning Service" /D "services\learning-svc" npm start
start "Productivity Service" /D "services\productivity-svc" npm start
start "Knowledge Graph Service" /D "services\knowledge-graph-svc" npm start
start "Content Service" /D "services\content-svc" npm start
start "Analytics Service" /D "services\analytics-svc" npm start
start "Web Frontend" /D "web" npm run dev

echo All services started!
echo Gateway: http://localhost:3000
echo Web: http://localhost:3100
pause
