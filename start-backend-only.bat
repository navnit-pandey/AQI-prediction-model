@echo off
title AirQ Predict - Flask Backend
color 0E

echo.
echo  ============================================
echo    AirQ Predict - Backend Only
echo  ============================================
echo.
echo  Starting Flask on http://localhost:5000
echo.

cd /d "%~dp0"
.venv\Scripts\python.exe app.py

pause
