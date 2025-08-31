@echo off
title MangoLeads CRM - GUARANTEED TO WORK
color 0a
cls

echo.
echo ========================================
echo    🥭 MangoLeads CRM Professional
echo    ULTRA-RELIABLE STARTUP
echo ========================================
echo.

REM Navigate to project directory
cd /d "E:\Users\S\Documents\GIT\mangoleads"

:start
echo 🔄 Cleaning up any existing servers...
taskkill /F /IM node.exe >nul 2>&1

echo ⏳ Waiting for cleanup...
timeout /t 3 /nobreak >nul

echo 🚀 Starting MangoLeads CRM...
echo.

REM Start the ultra-simple server
"C:\Program Files\nodejs\node.exe" ultra-simple.js

echo.
echo 🔄 Server stopped. Restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto start
