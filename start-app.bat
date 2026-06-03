@echo off
title AirQ Predict - Starting Both Servers
color 0A

echo.
echo  ============================================
echo    AirQ Predict - One-Click Launcher
echo  ============================================
echo.
echo  Starting Flask backend on port 5000...
echo  Starting Next.js frontend on port 3000...
echo.

:: Start Flask backend in a new window
start "Flask Backend (port 5000)" cmd /k "cd /d %~dp0 && .venv\Scripts\python.exe app.py"

:: Wait 3 seconds for Flask to start
ping 127.0.0.1 -n 4 > nul

:: Start Next.js frontend in a new window
start "Next.js Frontend (port 3000)" cmd /k "cd /d %~dp0frontend && npx next dev"

:: Wait 3 seconds then open browser
ping 127.0.0.1 -n 4 > nul
start http://localhost:3000

echo.
echo  ============================================
echo    Both servers are running!
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo  ============================================
echo.
echo  Close this window anytime. The servers
echo  run in their own windows.
echo.
pause
