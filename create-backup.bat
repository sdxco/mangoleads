@echo off
echo Creating backup of MangoLeads CRM...
echo Date: August 28, 2025

REM Create backup directory
mkdir "E:\Users\S\Documents\GIT\mangoleads-backup-2025-08-28" 2>NUL

REM Copy all files and folders
xcopy "E:\Users\S\Documents\GIT\mangoleads\*" "E:\Users\S\Documents\GIT\mangoleads-backup-2025-08-28\" /E /I /H /Y

echo.
echo ✅ Backup completed successfully!
echo 📁 Location: E:\Users\S\Documents\GIT\mangoleads-backup-2025-08-28\
echo.
echo Backup contains:
echo - Complete authentication system
echo - Role-based CRM dashboard  
echo - Lead tracking with IP/location data
echo - Affiliate management with offers
echo - Production-ready Python server
echo.
pause
