@echo off
title MangoLeads CRM - Click to Start
cls

echo.
echo        ================================================
echo                  🥭 MangoLeads CRM Professional
echo        ================================================
echo.

REM Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1

REM Wait a moment
ping localhost -n 3 >nul

REM Change to the correct directory
cd /d "E:\Users\S\Documents\GIT\mangoleads"

echo        🚀 Starting your CRM...
echo        📱 Opening browser in a moment...
echo.

REM Start the server and keep window open
"C:\Program Files\nodejs\node.exe" simple-server.js

echo.
echo        ❌ Server stopped. Press any key to restart...
pause >nul
goto :eof
