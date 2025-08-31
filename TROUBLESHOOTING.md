# 🚨 MangoLeads CRM - Troubleshooting Guide

## ❌ If you see "This site can't be reached" or "Connection Refused"

### 🔧 Quick Fix (Try First):
1. **Double-click**: `🥭 START CRM.bat` 
2. **Wait 5 seconds** for the green startup message
3. **Open browser** and go to `http://localhost:3000`

### 🛠️ If Quick Fix Doesn't Work:

#### Method 1: Use Reliable Startup
```powershell
.\start-reliable.ps1
```

#### Method 2: Manual Startup
```powershell
# Step 1: Kill existing processes
taskkill /F /IM node.exe

# Step 2: Wait a moment
Start-Sleep -Seconds 3

# Step 3: Start server
& "C:\Program Files\nodejs\node.exe" simple-server.js
```

#### Method 3: Command Line
```cmd
cd "E:\Users\S\Documents\GIT\mangoleads"
"C:\Program Files\nodejs\node.exe" simple-server.js
```

### 🔍 Diagnostic Steps:

#### Check 1: Is Node.js Installed?
```powershell
& "C:\Program Files\nodejs\node.exe" --version
```
Should show: `v24.6.0` or similar

#### Check 2: Is Port 3000 Free?
```powershell
netstat -ano | findstr :3000
```
Should show nothing (empty) when CRM is stopped

#### Check 3: Test Server Health
After starting, test:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/health"
```

### 🚨 Common Issues & Solutions:

#### Problem: "node is not recognized"
**Solution**: Use full path:
```cmd
"C:\Program Files\nodejs\node.exe" simple-server.js
```

#### Problem: "Port already in use"
**Solution**: Kill all Node processes:
```powershell
Get-Process -Name "node" | Stop-Process -Force
```

#### Problem: "Access denied"
**Solution**: Run as Administrator:
1. Right-click PowerShell
2. Choose "Run as Administrator"
3. Run the startup script

#### Problem: Windows Firewall blocking
**Solution**: 
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js if not listed

### 🎯 Guaranteed Working Method:

```powershell
# Copy and paste this entire block:
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Set-Location "E:\Users\S\Documents\GIT\mangoleads"
& "C:\Program Files\nodejs\node.exe" simple-server.js
```

### 📱 Browser Issues:

If browser shows connection refused:
1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Try different browser**: Chrome, Edge, Firefox
3. **Try incognito/private mode**
4. **Manually type**: `http://localhost:3000` (don't use autocomplete)

### 🔄 Server Won't Stay Running:

If server starts but immediately stops:
1. Check for error messages in the terminal
2. Make sure no antivirus is blocking Node.js
3. Try running from a different directory
4. Use the `simple-server.js` instead of `server.js`

### 📞 Emergency Backup Method:

If nothing else works, create a simple HTTP server:
```powershell
Set-Location "E:\Users\S\Documents\GIT\mangoleads\public"
python -m http.server 8000
```
Then go to: `http://localhost:8000`

### ✅ Success Indicators:

You know it's working when you see:
- Terminal shows: "🥭 MangoLeads CRM Professional running at http://localhost:3000"
- Browser loads the purple gradient CRM interface
- You can see the stats cards and navigation tabs

### 🆘 Still Not Working?

1. Restart your computer
2. Check Windows Updates
3. Reinstall Node.js from https://nodejs.org
4. Run Windows Network Troubleshooter

---

**Remember**: The `🥭 START CRM.bat` file is designed to work with a simple double-click!
