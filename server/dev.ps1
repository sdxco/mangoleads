# Enhanced MangoLeads Development Script
param(
    [switch]$Enhanced,
    [switch]$Original,
    [switch]$Test,
    [int]$Port = 3000
)

Write-Host "=== MangoLeads v2 Development ===" -ForegroundColor Cyan
Write-Host ""

# Kill any existing Node processes on the port
$portCheck = netstat -an | findstr ":$Port "
if ($portCheck) {
    Write-Host "Stopping existing server on port $Port..." -ForegroundColor Yellow
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object OwningProcess
    foreach ($proc in $processes) {
        if ($proc.OwningProcess) {
            Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
}

if ($Enhanced) {
    Write-Host "Starting Enhanced MangoLeads v2 Server..." -ForegroundColor Green
    $env:PORT = $Port
    & "C:\Program Files\nodejs\node.exe" enhanced-server.js
} elseif ($Original) {
    Write-Host "Starting Original CRM Server..." -ForegroundColor Green
    $env:PORT = $Port
    & "C:\Program Files\nodejs\node.exe" crm-server.js
} elseif ($Test) {
    Write-Host "Running Enhanced Server Tests..." -ForegroundColor Green
    & "C:\Program Files\nodejs\node.exe" test-enhanced-server.js
} else {
    Write-Host "MangoLeads v2 Development Options:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  -Enhanced    Start the enhanced v2 server" -ForegroundColor White
    Write-Host "  -Original    Start the original CRM server" -ForegroundColor White
    Write-Host "  -Test        Run enhanced server tests" -ForegroundColor White
    Write-Host "  -Port        Specify port (default: 3000)" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\dev.ps1 -Enhanced" -ForegroundColor White
    Write-Host "  .\dev.ps1 -Original" -ForegroundColor White
    Write-Host "  .\dev.ps1 -Test" -ForegroundColor White
    Write-Host "  .\dev.ps1 -Enhanced -Port 8080" -ForegroundColor White
}
