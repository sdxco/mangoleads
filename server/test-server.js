import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080;
const INTAKE_API_KEY = 'test_api_key_123';

app.use(express.json());
app.use(cors());

// Mock data store for testing
let leads = [];
let logs = [];
let leadCounter = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'MangoLeads v2 Test Server Running!',
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

  const { first_name, last_name, email, country, phone, phonecc } = req.body;
  
  // Basic validation
  if (!first_name || !email || !country) {
    return res.status(400).json({ 
      error: 'Missing required fields: first_name, email, country' 
    });
  }

  // Create mock lead
  const lead = {
    id: leadCounter++,
    first_name,
    last_name: last_name || '',
    email,
    country,
    phone: phone || '',
    phonecc: phonecc || '',
    status: 'queued',
    created_at: new Date().toISOString()
  };

  leads.push(lead);

  // Simulate dispatch to mock integration
  setTimeout(() => {
    const log = {
      id: logs.length + 1,
      lead_id: lead.id,
      integration_id: 1,
      status: 'sent',
      http_code: 200,
      duration_ms: Math.floor(Math.random() * 500) + 100,
      response_body: JSON.stringify({ success: true, message: 'Lead accepted' }),
      created_at: new Date().toISOString()
    };
    logs.push(log);
    
    // Update lead status
    const leadIndex = leads.findIndex(l => l.id === lead.id);
    if (leadIndex !== -1) {
      leads[leadIndex].status = 'sent';
    }
  }, 1000);

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
    status: 'sent',
    http_code: 200,
    duration_ms: Math.floor(Math.random() * 500) + 100,
    response_body: JSON.stringify({ success: true, message: 'Lead re-dispatched' }),
    created_at: new Date().toISOString()
  };
  logs.push(log);

  res.json({ 
    successes: 1, 
    failures: 0,
    message: 'Lead re-dispatched successfully'
  });
});

// Get all leads (bonus endpoint for testing)
app.get('/api/leads', (req, res) => {
  res.json({ leads, total: leads.length });
});

app.listen(PORT, () => {
  console.log(`🚀 MangoLeads v2 Test Server running on http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   POST /api/leads/intake - Submit leads (requires x-api-key: ${INTAKE_API_KEY})`);
  console.log(`   GET  /api/leads/:id/logs - Get lead logs`);
  console.log(`   POST /api/leads/:id/dispatch - Re-dispatch lead`);
  console.log(`   GET  /api/leads - List all leads`);
  console.log(`\n🧪 Test with the landing page example or curl commands!`);
});
