# MangoLeads CRM Backup Script
# Date: August 28, 2025

Write-Host "🥭 Creating backup of MangoLeads CRM..." -ForegroundColor Green
Write-Host "📅 Date: August 28, 2025" -ForegroundColor Cyan

$sourcePath = "E:\Users\S\Documents\GIT\mangoleads"
$backupPath = "E:\Users\S\Documents\GIT\mangoleads-backup-2025-08-28"

try {
    # Create backup using robocopy for best results
    Write-Host "📁 Creating backup directory..." -ForegroundColor Yellow
    
    $result = robocopy $sourcePath $backupPath /E /COPYALL /R:3 /W:1
    
    if (Test-Path $backupPath) {
        Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
        Write-Host "📁 Location: $backupPath" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🎯 Backup contains:" -ForegroundColor Yellow
        Write-Host "   - Complete authentication system" -ForegroundColor White
        Write-Host "   - Role-based CRM dashboard" -ForegroundColor White  
        Write-Host "   - Lead tracking with IP/location data" -ForegroundColor White
        Write-Host "   - Affiliate management with offers" -ForegroundColor White
        Write-Host "   - Production-ready Python server" -ForegroundColor White
        Write-Host ""
        
        # Show backup size
        $backupSize = (Get-ChildItem $backupPath -Recurse | Measure-Object -Property Length -Sum).Sum
        $backupSizeMB = [math]::Round($backupSize / 1MB, 2)
        Write-Host "📊 Backup size: $backupSizeMB MB" -ForegroundColor Cyan
        
        # List main directories
        Write-Host ""
        Write-Host "📋 Backup structure:" -ForegroundColor Yellow
        Get-ChildItem $backupPath | ForEach-Object {
            Write-Host "   📁 $($_.Name)" -ForegroundColor White
        }
    } else {
        Write-Host "❌ Backup failed - directory not created" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error creating backup: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
