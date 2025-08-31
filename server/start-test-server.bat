@echo off
echo 🚀 Starting MangoLeads v2 Test Server...
echo.
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" test-server.js
pause
