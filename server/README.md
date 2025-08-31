# MangoLeads v2 Server

This is the new TypeScript/Express server for MangoLeads v2, designed to work with Supabase and provide a clean API for lead ingestion and management.

## Quick Start

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up environment:**
   - Copy `.env` and update with your Supabase credentials
   - Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
   - Set a secure `INTAKE_API_KEY`

3. **Set up Supabase database:**
   - Run the SQL from `supabase-schema.sql` in your Supabase SQL editor

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

```env
PORT=8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
INTAKE_API_KEY=supersecret_ingest_key
ALLOWED_ORIGINS=https://your-landing.com,https://your-crm.com
```

## API Endpoints

### Public Endpoints
- `POST /api/leads/intake` - Accept new leads from landing pages (requires API key)
- `GET /api/health` - Health check

### Admin Endpoints  
- `POST /api/leads/:id/dispatch` - Re-send a lead to integrations
- `GET /api/leads/:id/logs` - Get integration logs for a lead

## Features

- **Lead Ingestion**: Accept leads from any landing page with validation
- **Multi-Brand Support**: Configure different API integrations per brand
- **Automatic Dispatch**: Leads are automatically sent to configured integrations
- **Retry Logic**: Built-in cron job retries failed/queued leads every 2 minutes
- **Detailed Logging**: Track all API calls with response times and status codes
- **Flexible Auth**: Support for Bearer tokens, Basic auth, and custom API key headers
- **Field Mapping**: Map internal lead fields to external API requirements

## Testing

Test the intake endpoint with curl:

```bash
curl -X POST http://localhost:8080/api/leads/intake \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: supersecret_ingest_key' \
  -d '{
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john@example.com",
    "country": "US",
    "phone": "1234567890",
    "phonecc": "+1"
  }'
```

## Deployment

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting provider
3. Set environment variables in your hosting platform
4. Ensure your CORS origins are configured correctly

## Architecture

- **Express.js** - Web framework
- **Supabase** - Database and real-time subscriptions
- **TypeScript** - Type safety
- **Zod** - Runtime validation
- **Axios** - HTTP client for external API calls
- **node-cron** - Scheduled retry jobs
