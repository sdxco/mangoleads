# 🧪 MangoLeads v2 Local Testing Guide

## Quick Test Methods (No Setup Required)

### Method 1: Test with the Simple Browser (Already Open!)
I've opened the landing page example in VS Code's Simple Browser. To test locally:

1. **First, start the test server manually:**
   ```powershell
   # Open a new PowerShell terminal in VS Code (Terminal > New Terminal)
   cd server
   & "C:\Program Files\nodejs\node.exe" test-server.js
   ```

2. **You should see output like:**
   ```
   🚀 MangoLeads v2 Test Server running on http://localhost:8080
   📋 API Endpoints:
      GET  /api/health - Health check
      POST /api/leads/intake - Submit leads (requires x-api-key: test_api_key_123)
      GET  /api/leads/:id/logs - Get lead logs
      POST /api/leads/:id/dispatch - Re-dispatch lead
      GET  /api/leads - List all leads
   ```

3. **Test the form in the Simple Browser** - fill it out and submit!

### Method 2: Test with curl (PowerShell)
```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:8080/api/health"

# Test lead submission
$body = @{
    first_name = "John"
    last_name = "Doe"
    email = "john@example.com"
    country = "US"
    phone = "1234567890"
    phonecc = "+1"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "test_api_key_123"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/leads/intake" -Method POST -Body $body -Headers $headers
```

### Method 3: Test with VS Code REST Client
Create a file called `test-requests.http` and add:

```http
### Health Check
GET http://localhost:8080/api/health

### Submit a Lead
POST http://localhost:8080/api/leads/intake
Content-Type: application/json
x-api-key: test_api_key_123

{
  "first_name": "Jane",
  "last_name": "Smith", 
  "email": "jane@example.com",
  "country": "CA",
  "phone": "9876543210",
  "phonecc": "+1"
}

### Get All Leads
GET http://localhost:8080/api/leads

### Get Lead Logs (replace 1 with actual lead ID)
GET http://localhost:8080/api/leads/1/logs

### Re-dispatch Lead (replace 1 with actual lead ID)
POST http://localhost:8080/api/leads/1/dispatch
```

## 🚀 Starting the Server (Step by Step)

### Option A: Use VS Code Terminal
1. Open Terminal in VS Code (`Terminal > New Terminal`)
2. Navigate to server directory:
   ```powershell
   cd server
   ```
3. Start the test server:
   ```powershell
   & "C:\Program Files\nodejs\node.exe" test-server.js
   ```

### Option B: Use VS Code Tasks
1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "Tasks: Run Task"
3. Select "Start MangoLeads v2 Server" (if available)

### Option C: Use npm (if PATH is working)
```powershell
cd server
npm start  # if we add a start script
# OR directly:
node test-server.js
```

## 🧪 What to Test

### 1. Health Check
- **URL:** `GET http://localhost:8080/api/health`
- **Expected:** `{"ok": true, "message": "MangoLeads v2 Test Server Running!", ...}`

### 2. Lead Submission
- **URL:** `POST http://localhost:8080/api/leads/intake`
- **Headers:** `x-api-key: test_api_key_123`
- **Body:** JSON with required fields (first_name, email, country)
- **Expected:** `{"id": 1, "message": "Lead received and queued for processing"}`

### 3. View Leads
- **URL:** `GET http://localhost:8080/api/leads`
- **Expected:** List of all submitted leads

### 4. View Lead Logs
- **URL:** `GET http://localhost:8080/api/leads/1/logs`
- **Expected:** Integration logs for lead ID 1

### 5. Re-dispatch Lead
- **URL:** `POST http://localhost:8080/api/leads/1/dispatch`
- **Expected:** `{"successes": 1, "failures": 0, ...}`

## 🎯 Expected Test Flow

1. **Start server** → See startup message
2. **Submit lead via form** → Get success message with lead ID
3. **Check logs** → See integration attempt logs
4. **List all leads** → See your submitted lead
5. **Re-dispatch** → See successful re-dispatch

## 🔧 Troubleshooting

### "Node not found"
- Try using full path: `& "C:\Program Files\nodejs\node.exe" test-server.js`
- Or restart VS Code after Node.js installation

### "Port already in use"
- Change PORT in test-server.js from 8080 to 3001 or another free port

### "Cannot find module"
- Make sure you're in the `server` directory when running commands
- Check that `test-server.js` exists in the current directory

### CORS Errors
- The test server has CORS enabled for all origins
- If still having issues, check browser developer console

## 🎉 Success Indicators

- ✅ Server starts without errors
- ✅ Health endpoint returns JSON response
- ✅ Lead submission returns success with ID
- ✅ Logs show integration attempts
- ✅ Form submission works in browser
- ✅ All API endpoints respond correctly

## 🚀 Next Steps After Testing

Once local testing works:
1. Set up real Supabase database
2. Update environment variables
3. Test with TypeScript version (`npm run dev`)
4. Deploy to production
5. Connect to your existing CRM UI

The test server simulates the full v2 functionality without requiring database setup!
