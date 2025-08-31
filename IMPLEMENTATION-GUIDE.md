# MangoLeads v2 Implementation Guide

## ✅ What's Been Created

I've successfully set up the MangoLeads v2 server architecture in your workspace:

### New Server Structure
```
/server/
  ├── src/
  │   ├── index.ts          # Main Express server
  │   ├── env.ts            # Environment configuration
  │   ├── supabase.ts       # Supabase client
  │   ├── types.ts          # TypeScript types & validation
  │   ├── dispatcher.ts     # Lead dispatch logic
  │   └── routes.ts         # API endpoints
  ├── package.json          # Dependencies
  ├── tsconfig.json         # TypeScript config
  ├── .env                  # Environment variables (update this!)
  ├── supabase-schema.sql   # Database schema
  ├── landing-example.html  # Landing page example
  └── README.md             # Server documentation
```

### Updated VS Code Tasks
- Added tasks for installing dependencies and running the v2 server
- Available in Command Palette: `Tasks: Run Task`

## 🚀 Next Steps

### 1. Install Node.js (if not already installed)
1. Download from https://nodejs.org/
2. Install the LTS version
3. Restart VS Code after installation

### 2. Set Up Supabase Database
1. Go to https://supabase.com and create a new project
2. In the SQL editor, run the contents of `server/supabase-schema.sql`
3. Copy your project URL and service role key

### 3. Configure Environment
1. Edit `server/.env` with your Supabase credentials:
   ```env
   PORT=8080
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   INTAKE_API_KEY=your_secure_api_key_here
   ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
   ```

### 4. Install Dependencies & Start Server
```bash
# In VS Code terminal or Command Palette > Tasks: Run Task
cd server
npm install
npm run dev
```

### 5. Test the Setup
1. Server should start on http://localhost:8080
2. Test health endpoint: `GET http://localhost:8080/api/health`
3. Open `server/landing-example.html` in browser to test lead submission

## 🔄 Integration with Your Existing CRM

### Update Your Web App
1. Point your existing CRM to the new API endpoints:
   - `POST /api/leads/:id/dispatch` - Resend leads
   - `GET /api/leads/:id/logs` - View integration logs

### Example React Integration
```tsx
// Resend a lead
async function resendLead(id: number) {
  const response = await fetch(`/api/leads/${id}/dispatch`, { 
    method: 'POST' 
  });
  const result = await response.json();
  console.log(`Dispatched: ${result.successes} ok, ${result.failures} failed`);
}

// Get logs for a lead
async function getLeadLogs(id: number) {
  const response = await fetch(`/api/leads/${id}/logs`);
  const { logs } = await response.json();
  return logs;
}
```

## 🎯 Key Features Implemented

### ✅ Lead Ingestion Pipeline
- Secure API endpoint with key authentication
- Data validation with Zod schemas
- Automatic dispatch to configured integrations
- Built-in retry mechanism (every 2 minutes)

### ✅ Multi-Brand Integration Support
- Flexible authentication (Bearer, Basic, API Key headers)
- Custom field mapping per integration
- Required field validation
- Timeout configuration

### ✅ Comprehensive Logging
- HTTP status codes and response times
- Full response body capture (truncated at 5KB)
- Integration success/failure tracking
- Lead status management

### ✅ Developer Experience
- TypeScript for type safety
- Hot reload with nodemon
- VS Code task integration
- Comprehensive error handling

## 🔧 Customization

### Adding New Integrations
Add rows to the `integrations` table:
```sql
INSERT INTO integrations (brand_id, api_url, method, auth_type, auth_value, field_mapping, required_fields)
VALUES (
  1000, 
  'https://api.partner.com/leads',
  'POST',
  'bearer',
  'your_bearer_token',
  '{"firstName":"first_name","email":"email","country":"country"}',
  '{email,country}'
);
```

### Field Mapping Examples
```json
{
  "firstName": "first_name",
  "lastName": "last_name", 
  "emailAddress": "email",
  "phoneNumber": "phone",
  "countryCode": "country"
}
```

## 🚨 Security Considerations

### Environment Variables
- Keep `.env` files out of version control
- Use different API keys for different environments
- Rotate the `INTAKE_API_KEY` regularly

### CORS Configuration
- Update `ALLOWED_ORIGINS` with your actual domain(s)
- Remove localhost origins in production

### Rate Limiting (Recommended)
Consider adding rate limiting to the intake endpoint:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/leads/intake', limiter);
```

## 📊 Monitoring & Analytics

### Database Queries for Analytics
```sql
-- Lead status distribution
SELECT status, COUNT(*) FROM leads GROUP BY status;

-- Leads by brand (via integrations)
SELECT b.name, COUNT(DISTINCT l.lead_id) 
FROM integration_logs l 
JOIN integrations i ON i.id = l.integration_id 
JOIN brands b ON b.id = i.brand_id 
WHERE l.status = 'sent' 
GROUP BY b.name;

-- Success rates by integration
SELECT i.api_url, 
  COUNT(CASE WHEN l.status = 'sent' THEN 1 END) as successes,
  COUNT(CASE WHEN l.status = 'failed' THEN 1 END) as failures
FROM integration_logs l
JOIN integrations i ON i.id = l.integration_id
GROUP BY i.api_url;
```

## 🎨 UI Improvements (Suggested)

### Move API Integrations to Settings
1. Update navigation: `Leads | Brands | Analytics | Settings`
2. Create `/settings/integrations` route
3. Add integration management interface
4. Include test lead functionality

### Enhanced Lead Management
- Add status pills with colors (queued=amber, sent=green, failed=red)
- Expandable rows showing integration logs
- Bulk resend functionality
- Real-time status updates

## 🚀 Deployment Options

### Vercel (Serverless)
```json
// vercel.json in server/
{
  "functions": {
    "src/index.ts": {
      "maxDuration": 30
    }
  }
}
```

### Railway/Render (Node.js)
- Deploy the entire `server/` folder
- Set environment variables in the platform dashboard
- Ensure Node.js version matches your local setup

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

## 📋 Testing Checklist

- [ ] Node.js installed and npm available
- [ ] Supabase project created and schema applied
- [ ] Environment variables configured
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health endpoint responds: `GET http://localhost:8080/api/health`
- [ ] Landing page form submission works
- [ ] Integration logs appear in database
- [ ] Retry mechanism processes queued leads

## 🆘 Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Run `npm install` in the server directory
2. **Supabase connection issues**: Check URL and service key in `.env`
3. **CORS errors**: Add your frontend domain to `ALLOWED_ORIGINS`
4. **TypeScript errors**: Ensure all dependencies are installed
5. **Port conflicts**: Change `PORT` in `.env` if 8080 is in use

Need help? Check the logs in the terminal where the server is running for detailed error messages.
