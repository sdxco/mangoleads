#!/usr/bin/env powershell

# MangoLeads v2 - Quick Test & Development Script
Write-Host "🥭 MangoLeads v2 - Quick Test & Dev Environment" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "crm-server.js")) {
    Write-Host "❌ Please run this script from the /server directory" -ForegroundColor Red
    Write-Host "💡 Navigate to: cd server && .\quick-dev.ps1" -ForegroundColor Yellow
    exit 1
}

# Kill any existing server on port 3000
Write-Host "🔍 Checking for existing servers..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "🛑 Stopping existing server on port 3000..." -ForegroundColor Yellow
    $processes | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Start the CRM server
Write-Host "🚀 Starting MangoLeads v2 CRM Server..." -ForegroundColor Green
Write-Host ""

# Start server in background
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    & "C:\Program Files\nodejs\node.exe" crm-server.js
}

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
$attempts = 0
$maxAttempts = 15

do {
    Start-Sleep -Seconds 1
    $attempts++
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 2 -ErrorAction Stop
        if ($health.ok) {
            Write-Host "✅ Server started successfully!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
} while ($attempts -lt $maxAttempts)

if ($attempts -eq $maxAttempts) {
    Write-Host ""
    Write-Host "❌ Server failed to start within 15 seconds" -ForegroundColor Red
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
    exit 1
}

Write-Host ""
Write-Host "🎉 MangoLeads v2 CRM is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor White
Write-Host "   CRM Interface: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   API Health:    http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host "   API Docs:      http://localhost:3000/api/leads" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Test Checklist:" -ForegroundColor White
Write-Host "   □ Open CRM interface in browser" -ForegroundColor Gray
Write-Host "   □ Add test leads using the form" -ForegroundColor Gray
Write-Host "   □ View lead details and check all fields" -ForegroundColor Gray
Write-Host "   □ Check integration logs" -ForegroundColor Gray
Write-Host "   □ Test resend functionality" -ForegroundColor Gray
Write-Host "   □ Verify real-time updates" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Development Commands:" -ForegroundColor White
Write-Host "   Test API:     .\test-all.ps1" -ForegroundColor Gray
Write-Host "   Stop Server:  Ctrl+C in this window" -ForegroundColor Gray
Write-Host "   Restart:      .\quick-dev.ps1" -ForegroundColor Gray
Write-Host ""

# Open browser automatically
Write-Host "🌐 Opening CRM in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✨ Ready for testing! Press Ctrl+C to stop the server." -ForegroundColor Green
Write-Host ""

# Keep the script running and show server output
try {
    while ($job.State -eq 'Running') {
        $output = Receive-Job $job
        if ($output) {
            Write-Host $output -ForegroundColor White
        }
        Start-Sleep -Seconds 1
    }
} finally {
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "🛑 Server stopped." -ForegroundColor Yellow
}
