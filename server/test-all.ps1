# MangoLeads v2 Pre-Commit Test Script
Write-Host "🧪 Running MangoLeads v2 Pre-Commit Tests..." -ForegroundColor Green
Write-Host ""

# Check if server is running
Write-Host "🔍 Checking if server is running..." -ForegroundColor Yellow

# Test 1: Health Check
Write-Host "1. Testing health endpoint..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 5
    if ($health.ok) {
        Write-Host "   ✅ Health check passed" -ForegroundColor Green
        Write-Host "   📊 Server version: $($health.version)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Health check failed - server responded but not OK" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Server not responding on http://localhost:8080" -ForegroundColor Red
    Write-Host "   💡 Start the server with: cd server && node test-server.js" -ForegroundColor Yellow
    exit 1
}

# Test 2: Lead Creation
Write-Host ""
Write-Host "2. Testing lead creation..." -ForegroundColor Cyan
try {
    $testLead = @{
        first_name = "TestUser"
        last_name = "PreCommit"
        email = "precommit.test@example.com"
        country = "US"
        phone = "1234567890"
        phonecc = "+1"
    } | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
        "x-api-key" = "test_api_key_123"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/leads/intake" -Method POST -Body $testLead -Headers $headers
    Write-Host "   ✅ Lead creation passed (ID: $($response.id))" -ForegroundColor Green
    $leadId = $response.id
} catch {
    Write-Host "   ❌ Lead creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: List Leads
Write-Host ""
Write-Host "3. Testing lead listing..." -ForegroundColor Cyan
try {
    $leads = Invoke-RestMethod -Uri "http://localhost:8080/api/leads"
    Write-Host "   ✅ Lead listing passed (Total: $($leads.total))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Lead listing failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Lead Logs
Write-Host ""
Write-Host "4. Testing lead logs..." -ForegroundColor Cyan
try {
    $logs = Invoke-RestMethod -Uri "http://localhost:8080/api/leads/$leadId/logs"
    Write-Host "   ✅ Lead logs passed (Logs: $($logs.logs.Count))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Lead logs failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 5: Lead Re-dispatch
Write-Host ""
Write-Host "5. Testing lead re-dispatch..." -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8080/api/leads/$leadId/dispatch" -Method POST
    Write-Host "   ✅ Re-dispatch passed (Successes: $($result.successes), Failures: $($result.failures))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Re-dispatch failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 6: Invalid API Key
Write-Host ""
Write-Host "6. Testing API key validation..." -ForegroundColor Cyan
try {
    $invalidHeaders = @{
        "Content-Type" = "application/json"
        "x-api-key" = "wrong_key"
    }
    
    $testLead = @{ first_name = "Test"; email = "test@example.com"; country = "US" } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:8080/api/leads/intake" -Method POST -Body $testLead -Headers $invalidHeaders -ErrorAction Stop
    Write-Host "   ❌ API key validation failed - should have been rejected" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✅ API key validation passed (correctly rejected)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ API key validation failed with unexpected error" -ForegroundColor Red
        exit 1
    }
}

# Test 7: Required Field Validation
Write-Host ""
Write-Host "7. Testing required field validation..." -ForegroundColor Cyan
try {
    $invalidLead = @{ first_name = "Test" } | ConvertTo-Json
    $headers = @{
        "Content-Type" = "application/json"
        "x-api-key" = "test_api_key_123"
    }
    
    Invoke-RestMethod -Uri "http://localhost:8080/api/leads/intake" -Method POST -Body $invalidLead -Headers $headers -ErrorAction Stop
    Write-Host "   ❌ Required field validation failed - should have been rejected" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ✅ Required field validation passed (correctly rejected)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Required field validation failed with unexpected error" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 All tests passed! MangoLeads v2 is ready to commit." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor White
Write-Host "   ✅ Server health check" -ForegroundColor Green
Write-Host "   ✅ Lead creation" -ForegroundColor Green  
Write-Host "   ✅ Lead listing" -ForegroundColor Green
Write-Host "   ✅ Lead logs retrieval" -ForegroundColor Green
Write-Host "   ✅ Lead re-dispatch" -ForegroundColor Green
Write-Host "   ✅ API key validation" -ForegroundColor Green
Write-Host "   ✅ Required field validation" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ready for git commit!" -ForegroundColor Magenta
