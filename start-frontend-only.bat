@echo off
title AirQ Predict - Next.js Frontend
color 0B

echo.
echo  ============================================
echo    AirQ Predict - Frontend Only
echo  ============================================
echo.
echo  Starting Next.js on http://localhost:3000
echo  (Make sure Flask backend is running on 5000)
echo.

cd /d "%~dp0frontend"
npx next dev

pause
