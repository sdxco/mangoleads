@echo off
cls
echo.
echo ================================================================
echo     🔐 MangoLeads CRM with Authentication & Affiliates 🔐
echo ================================================================
echo.

REM Check if Node.js is available
if not exist "C:\Program Files\nodejs\node.exe" (
    echo ❌ Error: Node.js not found at "C:\Program Files\nodejs\node.exe"
    echo 💡 Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Kill any existing node processes
echo 🔄 Cleaning up any existing processes...
taskkill /F /IM node.exe >nul 2>&1

REM Wait for cleanup
echo ⏳ Waiting for cleanup...
timeout /t 3 /nobreak >nul

REM Check if port 3000 is free
echo 🔍 Checking port availability...
netstat -ano | findstr :3000 >nul
if %errorlevel% == 0 (
    echo ⚠️  Port 3000 is still in use, waiting longer...
    timeout /t 5 /nobreak >nul
)

REM Start the authenticated server
echo.
echo 🚀 Starting MangoLeads CRM with Authentication...
echo =====================================
echo.

"C:\Program Files\nodejs\node.exe" auth-server.js

echo.
echo 🛑 Server stopped.
echo =====================================
echo.
pause
