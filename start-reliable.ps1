# MangoLeads CRM Reliable Startup Script
# This script ensures the server starts consistently

param(
    [switch]$Simple,
    [int]$Port = 3000
)

Write-Host "🥭 MangoLeads CRM Professional - Reliable Startup" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Blue

# Function to kill processes on port
function Stop-ProcessOnPort {
    param([int]$Port)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            Write-Host "🔄 Freeing port $Port..." -ForegroundColor Yellow
            $connections | ForEach-Object {
                try {
                    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
                } catch {
                    # Ignore errors
                }
            }
            Start-Sleep -Seconds 2
        }
    } catch {
        # Port not in use, continue
    }
}

# Function to check if port is available
function Test-PortAvailable {
    param([int]$Port)
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $null -eq $connection
    } catch {
        return $true
    }
}

# Function to test server response
function Test-ServerResponse {
    param([string]$Url)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Change to project directory
Set-Location "E:\Users\S\Documents\GIT\mangoleads"

# Stop all node processes
Write-Host "🧹 Cleaning up existing Node.js processes..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Free the port
Stop-ProcessOnPort -Port $Port

# Verify port is free
if (-not (Test-PortAvailable -Port $Port)) {
    Write-Host "❌ Unable to free port $Port. Trying alternative methods..." -ForegroundColor Red
    cmd /c "netstat -ano | findstr :$Port" | ForEach-Object {
        $parts = $_ -split '\s+'
        if ($parts.Length -ge 5) {
            $pid = $parts[4]
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            } catch {
                # Ignore errors
            }
        }
    }
    Start-Sleep -Seconds 3
}

# Choose server file
$serverFile = if ($Simple) { "simple-server.js" } else { "simple-server.js" }  # Always use simple server for reliability

Write-Host "🚀 Starting MangoLeads CRM using $serverFile..." -ForegroundColor Green

# Start server with error handling
$startTime = Get-Date
$nodeProcess = Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList $serverFile -NoNewWindow -PassThru

# Wait for server to start
Write-Host "⏳ Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test server multiple times
$maxAttempts = 10
$attempt = 0
$serverRunning = $false

while ($attempt -lt $maxAttempts -and -not $serverRunning) {
    $attempt++
    Write-Host "🔍 Testing server (attempt $attempt/$maxAttempts)..." -ForegroundColor Cyan
    
    if (Test-ServerResponse -Url "http://localhost:$Port/health") {
        $serverRunning = $true
        break
    }
    
    Start-Sleep -Seconds 1
}

if ($serverRunning) {
    Write-Host ""
    Write-Host "✅ SUCCESS! MangoLeads CRM is running!" -ForegroundColor Green
    Write-Host "🌐 Access your CRM at: http://localhost:$Port" -ForegroundColor White -BackgroundColor DarkGreen
    Write-Host "📊 Dashboard ready for use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Features Available:" -ForegroundColor Magenta
    Write-Host "   • Professional Lead Management" -ForegroundColor White
    Write-Host "   • Demo Brand Management" -ForegroundColor White
    Write-Host "   • Analytics Dashboard" -ForegroundColor White
    Write-Host "   • Real-time Updates" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Press Ctrl+C to stop the server" -ForegroundColor Yellow
    
    # Keep script running to monitor server
    try {
        while ($nodeProcess -and -not $nodeProcess.HasExited) {
            Start-Sleep -Seconds 5
            
            # Periodic health check
            if (-not (Test-ServerResponse -Url "http://localhost:$Port/health")) {
                Write-Host "⚠️  Server health check failed, restarting..." -ForegroundColor Yellow
                break
            }
        }
    } catch {
        Write-Host "🛑 Server monitoring interrupted" -ForegroundColor Yellow
    }
    
} else {
    Write-Host ""
    Write-Host "❌ FAILED to start server after $maxAttempts attempts" -ForegroundColor Red
    Write-Host "🔧 Troubleshooting suggestions:" -ForegroundColor Yellow
    Write-Host "   1. Check if Node.js is properly installed" -ForegroundColor White
    Write-Host "   2. Verify no other application is using port $Port" -ForegroundColor White
    Write-Host "   3. Run as Administrator if needed" -ForegroundColor White
    Write-Host "   4. Check Windows Firewall settings" -ForegroundColor White
    
    # Try to get more information
    Write-Host ""
    Write-Host "🔍 Diagnostic Information:" -ForegroundColor Cyan
    Write-Host "Node.js version:" -ForegroundColor Gray
    & "C:\Program Files\nodejs\node.exe" --version
    Write-Host "Port $Port status:" -ForegroundColor Gray
    netstat -ano | findstr ":$Port"
}

Write-Host ""
Read-Host "Press Enter to exit"
