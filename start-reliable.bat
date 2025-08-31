@echo off
title MangoLeads CRM Professional
color 0A

echo.
echo ================================================
echo   🥭 MangoLeads CRM Professional
echo   Starting reliable local server...
echo ================================================
echo.

:: Kill any existing node processes
echo 🔄 Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1

:: Wait for cleanup
timeout /t 2 /nobreak >nul

:: Check if port 3000 is free
echo 🔍 Checking port availability...
netstat -ano | findstr :3000 >nul
if %errorlevel%==0 (
    echo ⚠️  Port 3000 is in use, attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

:: Navigate to project directory
cd /d "E:\Users\S\Documents\GIT\mangoleads"

echo 🚀 Starting MangoLeads CRM...
echo.

:: Start the simple server (more reliable)
"C:\Program Files\nodejs\node.exe" simple-server.js

:: If that fails, try the main server
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Simple server failed, trying main server...
    "C:\Program Files\nodejs\node.exe" server.js
)

echo.
echo ❌ Server stopped unexpectedly
pause
