# MangoLeads CRM Start Script
# Professional Lead Management System

Write-Host "🥭 Starting MangoLeads CRM Professional..." -ForegroundColor Green

# Kill any existing node processes on port 3000
try {
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "⚠️  Stopping existing server on port 3000..." -ForegroundColor Yellow
        taskkill /F /IM node.exe 2>$null
        Start-Sleep -Seconds 2
    }
} catch {
    # Port not in use, continue
}

# Start the server
Write-Host "🔧 Starting professional CRM server..." -ForegroundColor Cyan
Set-Location "E:\Users\S\Documents\GIT\mangoleads"

# Start server in background
Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList "server.js" -WindowStyle Minimized

# Wait for server to start
Start-Sleep -Seconds 3

# Test if server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ MangoLeads CRM Professional is running at http://localhost:3000" -ForegroundColor Green
    Write-Host "🌐 Open your browser and navigate to: http://localhost:3000" -ForegroundColor White
} catch {
    Write-Host "❌ Server failed to start properly" -ForegroundColor Red
    Write-Host "🔍 Check the terminal output for errors" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 MangoLeads CRM Professional Features:" -ForegroundColor Magenta
Write-Host "   • 📊 Professional Lead Management Dashboard" -ForegroundColor White
Write-Host "   • 🏢 Brand Management (Demo Trading Platform)" -ForegroundColor White  
Write-Host "   • 📈 Analytics & Performance Reports" -ForegroundColor White
Write-Host "   • 🎨 Modern Professional Design" -ForegroundColor White
Write-Host "   • 💾 Mock Database (no PostgreSQL required)" -ForegroundColor White
Write-Host "   • 🔄 Real-time Brand Activation/Deactivation" -ForegroundColor White

Write-Host ""
Write-Host "🎨 Design Features:" -ForegroundColor Blue
Write-Host "   • Glass-morphism effects" -ForegroundColor Gray
Write-Host "   • Gradient backgrounds" -ForegroundColor Gray
Write-Host "   • Professional color scheme" -ForegroundColor Gray
Write-Host "   • Smooth animations" -ForegroundColor Gray
Write-Host "   • Responsive layout" -ForegroundColor Gray

Read-Host "Press Enter to continue..."
