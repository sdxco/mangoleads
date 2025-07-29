# Mock Brand Testing Guide

## 🎯 Purpose
Test the complete lead flow using a mock brand that stores leads in the CRM without external API calls.

## 🏗️ Mock Brand Configuration

**Brand ID**: `mock-trading-test`
**Brand Name**: Mock Trading Test
**Type**: Internal (CRM storage only)
**Affiliate ID**: 28215
**Offer ID**: 1000

## 🚀 Testing Steps

### 1. Start the CRM Server
```bash
# Option A: Use the quick start script
./start-crm.sh

# Option B: Manual start
cd lead-crm
npm start
```

Server will be available at: `http://localhost:4000`

### 2. Test Landing Page Configuration
The landing page is now configured to use the mock brand:
- **Domain**: https://autotradeiq-reg.store
- **Brand**: mock-trading-test
- **CRM URL**: http://autotradeiq-crm.space

### 3. Run Automated Tests
```bash
# Test the mock brand integration
node test-external-integration.js
```

This will:
- ✅ Test mock brand lead submission
- ✅ Verify lead storage in CRM database
- ✅ Check brand configuration validation
- ✅ Test error handling

### 4. Manual Testing

#### Test the Landing Page:
1. Visit: https://autotradeiq-reg.store
2. Fill out the form with test data
3. Submit the form
4. Verify success message appears

#### Check the CRM Dashboard:
1. Open: http://localhost:4000 (if testing locally)
2. Navigate to the leads table
3. Look for your test lead with:
   - Brand: "Mock Trading Test"
   - Status: "queued" or "sent"
   - All form data populated correctly

#### Test the API Modal:
1. Click the gear icon (⚙️) in the bottom-right of the dashboard
2. Fill out the test form in the modal
3. Submit and verify the lead appears in the table

## 📊 Expected Results

### Successful Test Lead:
```json
{
  "id": 123,
  "status": "queued",
  "brand": "Mock Trading Test",
  "brand_id": "mock-trading-test"
}
```

### Lead in Dashboard:
- **First Name**: Your test data
- **Last Name**: Your test data
- **Email**: Your test email
- **Phone**: Your test phone
- **Country**: Selected country
- **Brand Name**: Mock Trading Test
- **Status**: queued (green indicator)
- **Affiliate ID**: 28215
- **Offer ID**: 1000

## 🔍 Verification Checklist

- [ ] CRM server starts without errors
- [ ] Landing page loads and detects country/phone code
- [ ] Form submission shows success message
- [ ] Lead appears in CRM dashboard
- [ ] Brand shows as "Mock Trading Test"
- [ ] All form fields are populated correctly
- [ ] Status is "queued" (internal brand)
- [ ] No external API calls are made
- [ ] API modal testing works

## 🐛 Troubleshooting

### Landing Page Issues:
- **DNS not propagated**: Use Netlify subdomain temporarily
- **CORS errors**: Check server.js CORS configuration
- **Form not submitting**: Check browser console for errors

### CRM Issues:
- **Server won't start**: Check PostgreSQL is running
- **Leads not appearing**: Check server logs for database errors
- **Database errors**: Verify schema with essential-migration.sql

### Common Solutions:
```bash
# Restart CRM server
cd lead-crm
npm start

# Check server logs
# Look for any error messages in terminal

# Test API directly
curl -X POST http://localhost:4000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@example.com","phonecc":"+1","phone":"1234567890","country":"US","brand_id":"mock-trading-test"}'
```

## ✅ Success Criteria

**Mock testing is successful when:**
1. ✅ Landing page submits leads successfully
2. ✅ Leads appear in CRM dashboard
3. ✅ No external API calls are made
4. ✅ All data fields are correctly populated
5. ✅ Status tracking works properly

## 🚀 Next Steps After Mock Testing

Once mock testing is complete and working:

1. **Configure Real Brands**: Update brands-config.js with external APIs
2. **Update Landing Page**: Change BRAND_ID to real brand
3. **Test External Integration**: Use real brand endpoints
4. **Monitor Performance**: Track external API responses
5. **Scale Up**: Deploy to production with real traffic

---

**Ready for Mock Testing** ✅  
The system is configured to safely test the complete lead flow without external API calls.
