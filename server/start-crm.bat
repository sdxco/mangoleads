@echo off
echo 🥭 Starting MangoLeads v2 CRM Server...
echo.
cd /d "%~dp0"
echo Starting server with CRM interface...
echo.
echo 🌐 Open your browser to: http://localhost:3000
echo.
"C:\Program Files\nodejs\node.exe" crm-server.js
pause
