#!/usr/bin/env powershell

# MangoLeads v2 Quick Start & Test Script
Write-Host "🚀 MangoLeads v2 - Quick Start & Test" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "test-server.js")) {
    Write-Host "❌ Please run this script from the /server directory" -ForegroundColor Red
    Write-Host "💡 Run: cd server && .\quick-test.ps1" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is available
try {
    $nodeVersion = & "C:\Program Files\nodejs\node.exe" --version 2>$null
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if server is already running
Write-Host ""
Write-Host "🔍 Checking if server is already running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Server is already running!" -ForegroundColor Green
    $serverRunning = $true
} catch {
    Write-Host "📝 Server not running, will start it..." -ForegroundColor Gray
    $serverRunning = $false
}

# Start server if not running
if (!$serverRunning) {
    Write-Host ""
    Write-Host "🚀 Starting test server..." -ForegroundColor Cyan
    
    # Start server in background
    $job = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        & "C:\Program Files\nodejs\node.exe" test-server.js
    }
    
    # Wait for server to start
    Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
    $attempts = 0
    $maxAttempts = 10
    
    do {
        Start-Sleep -Seconds 1
        $attempts++
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 2
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
        Write-Host "❌ Server failed to start within 10 seconds" -ForegroundColor Red
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -ErrorAction SilentlyContinue
        exit 1
    }
    
    Write-Host ""
    Write-Host "🎉 Server is now running on http://localhost:8080" -ForegroundColor Green
}

# Run tests
Write-Host ""
Write-Host "🧪 Running comprehensive tests..." -ForegroundColor Cyan
Write-Host ""

try {
    .\test-all.ps1
    Write-Host ""
    Write-Host "🎉 ALL TESTS PASSED! Ready to commit to GitHub! 🎉" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Tests failed. Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📁 Useful files:" -ForegroundColor White
Write-Host "   • test-requests.http  - VS Code REST Client tests" -ForegroundColor Gray
Write-Host "   • landing-example.html - Form testing in browser" -ForegroundColor Gray
Write-Host "   • test-server.js - Simple test server (current)" -ForegroundColor Gray
Write-Host "   • src/ - Full TypeScript implementation" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Open in browser:" -ForegroundColor White
Write-Host "   • http://localhost:8080/api/health" -ForegroundColor Gray
Write-Host "   • file:///$(Get-Location)/landing-example.html" -ForegroundColor Gray
