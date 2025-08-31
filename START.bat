@echo off
title MangoLeads CRM Professional
cls

echo.
echo ====================================
echo    🥭 MangoLeads CRM Professional
echo ====================================
echo.

REM Change to project directory
cd /d "E:\Users\S\Documents\GIT\mangoleads"

REM Kill any existing node processes
echo 🔄 Cleaning up...
taskkill /F /IM node.exe >nul 2>&1

REM Wait for cleanup
timeout /t 2 /nobreak >nul

echo 🚀 Starting CRM Server...
echo.

REM Start the ultra-simple server (most reliable)
"C:\Program Files\nodejs\node.exe" ultra-simple.js

echo.
echo Server stopped. Press any key to restart...
pause >nul
cls
goto start
