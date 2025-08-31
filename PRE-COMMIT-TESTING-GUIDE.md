# 🧪 MangoLeads v2 - Complete Local Testing Guide

## 📋 Pre-Commit Testing Checklist

### ✅ **Phase 1: Basic Setup Verification**

1. **Verify Node.js Installation**
   ```powershell
   node --version  # Should show v24.6.0 or similar
   npm --version   # Should show 11.5.1 or similar
   ```

2. **Check Project Structure**
   ```
   ✅ /server/src/          - TypeScript source files
   ✅ /server/package.json  - Dependencies defined
   ✅ /server/test-server.js - Test server for quick testing
   ✅ /server/.env          - Environment template
   ✅ /server/test-requests.http - API test file
   ```

### ✅ **Phase 2: Start Test Server**

**Option A: Using Batch File (Recommended)**
```cmd
cd server
start-test-server.bat
```

**Option B: Manual Start**
```powershell
cd server
& "C:\Program Files\nodejs\node.exe" test-server.js
```

**Expected Output:**
```
🚀 MangoLeads v2 Test Server running on http://localhost:8080
📋 API Endpoints:
   GET  /api/health - Health check
   POST /api/leads/intake - Submit leads
   GET  /api/leads/:id/logs - Get lead logs
   POST /api/leads/:id/dispatch - Re-dispatch lead
   GET  /api/leads - List all leads
```

### ✅ **Phase 3: API Testing**

#### 3.1 Health Check Test
```powershell
# PowerShell method
Invoke-RestMethod -Uri "http://localhost:8080/api/health"

# Expected Response:
# {
#   "ok": true,
#   "message": "MangoLeads v2 Test Server Running!",
#   "timestamp": "2025-08-26T...",
#   "version": "2.0.0-test"
# }
```

#### 3.2 Lead Submission Test
```powershell
$testLead = @{
    first_name = "John"
    last_name = "Doe"
    email = "john.doe@example.com"
    country = "US"
    phone = "1234567890"
    phonecc = "+1"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "test_api_key_123"
}

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/leads/intake" -Method POST -Body $testLead -Headers $headers
Write-Host "Lead created with ID: $($response.id)"
```

#### 3.3 View All Leads
```powershell
$leads = Invoke-RestMethod -Uri "http://localhost:8080/api/leads"
Write-Host "Total leads: $($leads.total)"
$leads.leads | Format-Table
```

#### 3.4 View Lead Logs
```powershell
# Replace 1 with actual lead ID from previous test
$logs = Invoke-RestMethod -Uri "http://localhost:8080/api/leads/1/logs"
$logs.logs | Format-Table
```

#### 3.5 Test Re-dispatch
```powershell
$result = Invoke-RestMethod -Uri "http://localhost:8080/api/leads/1/dispatch" -Method POST
Write-Host "Successes: $($result.successes), Failures: $($result.failures)"
```

### ✅ **Phase 4: Browser Testing**

1. **Open Landing Page Example**
   - File: `server/landing-example.html`
   - Open in browser or use VS Code Simple Browser
   - Fill out form and submit
   - Should see success message with lead ID

2. **Direct API Access**
   - Visit: http://localhost:8080/api/health
   - Should see JSON response in browser

### ✅ **Phase 5: HTTP File Testing**

1. **Install REST Client Extension** (if not already installed)
   ```
   ext install humao.rest-client
   ```

2. **Open Test File**
   - Open `server/test-requests.http`
   - Click "Send Request" above each test
   - Verify responses for each endpoint

### ✅ **Phase 6: Error Handling Tests**

#### 6.1 Test Invalid API Key
```http
POST http://localhost:8080/api/leads/intake
Content-Type: application/json
x-api-key: wrong_key

{
  "first_name": "Test",
  "email": "test@example.com",
  "country": "US"
}
```
**Expected:** 401 Unauthorized

#### 6.2 Test Missing Required Fields
```http
POST http://localhost:8080/api/leads/intake
Content-Type: application/json
x-api-key: test_api_key_123

{
  "first_name": "Test"
}
```
**Expected:** 400 Bad Request

#### 6.3 Test Non-existent Lead
```http
GET http://localhost:8080/api/leads/999/logs
```
**Expected:** Empty logs array

### ✅ **Phase 7: TypeScript Version Testing**

Once basic testing passes, test the full TypeScript version:

1. **Install Dependencies**
   ```powershell
   cd server
   npm install
   ```

2. **Start TypeScript Dev Server**
   ```powershell
   npm run dev
   ```

3. **Test Same Endpoints** (should work identically)

### ✅ **Phase 8: Performance & Load Testing**

#### 8.1 Multiple Rapid Requests
```powershell
for ($i=1; $i -le 10; $i++) {
    $testLead = @{
        first_name = "User$i"
        email = "user$i@example.com"
        country = "US"
    } | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
        "x-api-key" = "test_api_key_123"
    }
    
    Invoke-RestMethod -Uri "http://localhost:8080/api/leads/intake" -Method POST -Body $testLead -Headers $headers
    Write-Host "Created lead $i"
}
```

#### 8.2 Verify All Leads Created
```powershell
$leads = Invoke-RestMethod -Uri "http://localhost:8080/api/leads"
Write-Host "Total leads after bulk test: $($leads.total)"
```

## 🔍 **Debugging Common Issues**

### Server Won't Start
- **Check Node.js path:** Ensure Node.js is installed correctly
- **Check port conflicts:** Try changing port in test-server.js
- **Check file location:** Ensure you're in the `/server` directory

### API Returns Errors
- **401 Unauthorized:** Check API key is exactly `test_api_key_123`
- **400 Bad Request:** Check required fields (first_name, email, country)
- **500 Internal Error:** Check server console for error messages

### CORS Issues
- Test server allows all origins by default
- If still having issues, check browser developer console

## 📊 **Expected Test Results**

### ✅ Success Criteria
- [ ] Health endpoint returns 200 OK
- [ ] Lead submission returns 201 Created with ID
- [ ] All leads endpoint returns array
- [ ] Lead logs show integration attempts
- [ ] Re-dispatch returns success counts
- [ ] Landing page form works
- [ ] Invalid requests return proper error codes
- [ ] API key validation works
- [ ] Required field validation works
- [ ] Server handles multiple rapid requests

### 🚨 Failure Indicators
- Server crashes or won't start
- Health endpoint returns error
- Lead submission fails
- API returns 500 errors
- CORS errors in browser
- Memory leaks during load testing

## 🚀 **Pre-Commit Validation Script**

Create `test-all.ps1`:
```powershell
# MangoLeads v2 Pre-Commit Test Script
Write-Host "🧪 Running MangoLeads v2 Pre-Commit Tests..." -ForegroundColor Green

# Test 1: Health Check
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health"
    if ($health.ok) {
        Write-Host "✅ Health check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Health check failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Server not responding" -ForegroundColor Red
    exit 1
}

# Test 2: Lead Creation
try {
    $testLead = @{
        first_name = "TestUser"
        email = "test@example.com"
        country = "US"
    } | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
        "x-api-key" = "test_api_key_123"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/leads/intake" -Method POST -Body $testLead -Headers $headers
    Write-Host "✅ Lead creation passed (ID: $($response.id))" -ForegroundColor Green
} catch {
    Write-Host "❌ Lead creation failed" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 All tests passed! Ready to commit." -ForegroundColor Green
```

## 📝 **Git Commit Checklist**

Before committing:
- [ ] All tests pass
- [ ] No console errors
- [ ] Code is properly formatted
- [ ] Environment variables are documented
- [ ] README files are updated
- [ ] Dependencies are properly listed
- [ ] No sensitive data in commits

**Ready to commit when all checkboxes are ✅!**
