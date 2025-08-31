import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const INTAKE_API_KEY = 'test_api_key_123';

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Mock data store for testing
let leads = [];
let logs = [];
let leadCounter = 1;

// Serve the CRM interface at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'MangoLeads v2 CRM Server Running!',
    timestamp: new Date().toISOString(),
    version: '2.0.0-test'
  });
});

// Lead intake endpoint
app.post('/api/leads/intake', (req, res) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey || apiKey !== INTAKE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }

  const { 
    first_name, last_name, email, country, phone, phonecc, 
    age, user_ip, brand_id, brand_name, tracker_url, 
    aff_id, offer_id, aff_sub, aff_sub2, aff_sub3, aff_sub4, aff_sub5,
    orig_offer, referer, utm_source, utm_medium, utm_campaign
  } = req.body;
  
  // Basic validation
  if (!first_name || !email || !country) {
    return res.status(400).json({ 
      error: 'Missing required fields: first_name, email, country' 
    });
  }

  // Create comprehensive lead (matching v1 structure)
  const lead = {
    id: leadCounter++,
    first_name,
    last_name: last_name || '',
    email,
    country,
    phone: phone || '',
    phonecc: phonecc || '',
    age: age || null,
    user_ip: user_ip || '',
    brand_id: brand_id || 'default',
    brand_name: brand_name || 'Default Brand',
    tracker_url: tracker_url || '',
    aff_id: aff_id || '',
    offer_id: offer_id || '',
    aff_sub: aff_sub || '',
    aff_sub2: aff_sub2 || '',
    aff_sub3: aff_sub3 || '',
    aff_sub4: aff_sub4 || '',
    aff_sub5: aff_sub5 || '',
    orig_offer: orig_offer || '',
    referer: referer || '',
    utm_source: utm_source || '',
    utm_medium: utm_medium || '',
    utm_campaign: utm_campaign || '',
    status: 'queued',
    attempts: 0,
    last_error: null,
    sent_at: null,
    created_at: new Date().toISOString()
  };

  leads.push(lead);

  // Simulate dispatch to real integrations
  setTimeout(async () => {
    // Update attempts
    const leadIndex = leads.findIndex(l => l.id === lead.id);
    if (leadIndex !== -1) {
      leads[leadIndex].attempts = (leads[leadIndex].attempts || 0) + 1;
    }

    // Simulate real API call
    const integrationSuccess = Math.random() > 0.2; // 80% success rate for demo
    
    const log = {
      id: logs.length + 1,
      lead_id: lead.id,
      integration_id: 1,
      integration_name: lead.brand_name || 'Default Trading API',
      status: integrationSuccess ? 'sent' : 'failed',
      http_code: integrationSuccess ? 200 : 500,
      duration_ms: Math.floor(Math.random() * 500) + 100,
      response_body: integrationSuccess 
        ? JSON.stringify({ 
            success: true, 
            message: 'Lead accepted successfully', 
            external_id: `EXT_${lead.id}`,
            timestamp: new Date().toISOString()
          })
        : JSON.stringify({ 
            error: 'API temporarily unavailable', 
            code: 'API_ERROR',
            retry_after: 300 
          }),
      created_at: new Date().toISOString()
    };
    
    logs.push(log);
    
    // Update lead status
    if (leadIndex !== -1) {
      leads[leadIndex].status = integrationSuccess ? 'sent' : 'failed';
      leads[leadIndex].sent_at = integrationSuccess ? new Date().toISOString() : null;
      leads[leadIndex].last_error = integrationSuccess ? null : 'API temporarily unavailable';
    }
  }, Math.floor(Math.random() * 2000) + 1000); // Random delay 1-3 seconds

  res.status(201).json({ 
    id: lead.id,
    message: 'Lead received and queued for processing'
  });
});

// Get lead logs
app.get('/api/leads/:id/logs', (req, res) => {
  const leadId = parseInt(req.params.id);
  const leadLogs = logs.filter(log => log.lead_id === leadId);
  res.json({ logs: leadLogs });
});

// Re-dispatch lead
app.post('/api/leads/:id/dispatch', (req, res) => {
  const leadId = parseInt(req.params.id);
  const lead = leads.find(l => l.id === leadId);
  
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  // Simulate re-dispatch
  const log = {
    id: logs.length + 1,
    lead_id: leadId,
    integration_id: 1,
    integration_name: 'Mock Trading API',
    status: 'sent',
    http_code: 200,
    duration_ms: Math.floor(Math.random() * 500) + 100,
    response_body: JSON.stringify({ success: true, message: 'Lead re-dispatched', external_id: `EXT_${leadId}_RETRY` }),
    created_at: new Date().toISOString()
  };
  logs.push(log);

  // Update lead status
  const leadIndex = leads.findIndex(l => l.id === leadId);
  if (leadIndex !== -1) {
    leads[leadIndex].status = 'sent';
  }

  res.json({ 
    successes: 1, 
    failures: 0,
    message: 'Lead re-dispatched successfully'
  });
});

// Get all leads (for CRM interface)
app.get('/api/leads', (req, res) => {
  res.json({ leads, total: leads.length });
});

// Delete a lead
app.delete('/api/leads/:id', (req, res) => {
  const leadId = parseInt(req.params.id);
  const leadIndex = leads.findIndex(l => l.id === leadId);
  
  if (leadIndex === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  
  leads.splice(leadIndex, 1);
  // Also remove associated logs
  logs = logs.filter(log => log.lead_id !== leadId);
  
  res.json({ message: 'Lead deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`🚀 MangoLeads v2 CRM Server running on http://localhost:${PORT}`);
  console.log(`📋 Web Interface: http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   POST /api/leads/intake - Submit leads (requires x-api-key: ${INTAKE_API_KEY})`);
  console.log(`   GET  /api/leads - List all leads`);
  console.log(`   GET  /api/leads/:id/logs - Get lead logs`);
  console.log(`   POST /api/leads/:id/dispatch - Re-dispatch lead`);
  console.log(`   DELETE /api/leads/:id - Delete lead`);
  console.log(`\n🎉 Open http://localhost:${PORT} in your browser to use the CRM!`);
});
