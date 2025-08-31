@echo off
cls
echo.
echo ================================================================
echo        🥭 MangoLeads CRM - ULTIMATE RELIABLE START 🥭
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

REM Kill any existing node processes thoroughly
echo 🔄 Cleaning up all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
wmic process where "name='node.exe'" delete >nul 2>&1

REM Wait for complete cleanup
echo ⏳ Waiting for complete cleanup...
timeout /t 5 /nobreak >nul

REM Check port availability and wait if needed
:CheckPort
netstat -ano | findstr :3000 >nul
if %errorlevel% == 0 (
    echo ⚠️  Port 3000 still in use, waiting...
    timeout /t 3 /nobreak >nul
    goto CheckPort
)

echo ✅ Port 3000 is now available!
echo.

REM Start the simple auth server (most reliable)
echo 🚀 Starting MangoLeads CRM (Simple Auth Version)...
echo =====================================
echo.

"C:\Program Files\nodejs\node.exe" simple-auth-server.js

echo.
echo 🛑 Server stopped.
echo =====================================
echo.
pause
