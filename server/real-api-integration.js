// Real API Integration Configuration
// Add this to your CRM server for real API calls

const REAL_INTEGRATIONS = [
  {
    id: 1,
    name: 'Trading Platform API',
    url: 'https://api.trading-platform.com/leads',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN',
      'Content-Type': 'application/json',
      'X-Partner-ID': 'YOUR_PARTNER_ID'
    },
    fieldMapping: {
      // Map our fields to their API fields
      'firstName': 'first_name',
      'lastName': 'last_name',
      'email': 'email',
      'phone': 'phone',
      'country': 'country',
      'source': 'utm_source',
      'campaign': 'utm_campaign'
    },
    requiredFields: ['firstName', 'email', 'country']
  },
  {
    id: 2,
    name: 'Binary Options API',
    url: 'https://api.binary-broker.com/v1/leads',
    method: 'POST',
    headers: {
      'X-API-Key': 'YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    fieldMapping: {
      'name': 'first_name',
      'surname': 'last_name',
      'mail': 'email',
      'telephone': 'phone',
      'country_code': 'country'
    },
    requiredFields: ['name', 'mail', 'country_code']
  }
];

// Function to send lead to real APIs
async function sendLeadToRealAPI(lead, integration) {
  const startTime = Date.now();
  
  try {
    // Map fields according to integration config
    const payload = {};
    for (const [apiField, leadField] of Object.entries(integration.fieldMapping)) {
      payload[apiField] = lead[leadField];
    }
    
    // Add any additional required fields
    payload.ip = lead.user_ip;
    payload.source = 'mangoleads-crm';
    payload.timestamp = new Date().toISOString();
    
    const response = await fetch(integration.url, {
      method: integration.method,
      headers: integration.headers,
      body: JSON.stringify(payload),
      timeout: 10000 // 10 second timeout
    });
    
    const responseData = await response.text();
    const duration = Date.now() - startTime;
    
    // Log the attempt
    const log = {
      id: logs.length + 1,
      lead_id: lead.id,
      integration_id: integration.id,
      integration_name: integration.name,
      status: response.ok ? 'sent' : 'failed',
      http_code: response.status,
      duration_ms: duration,
      response_body: responseData.slice(0, 5000), // Limit response size
      created_at: new Date().toISOString()
    };
    
    logs.push(log);
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log the error
    const log = {
      id: logs.length + 1,
      lead_id: lead.id,
      integration_id: integration.id,
      integration_name: integration.name,
      status: 'failed',
      http_code: 0,
      duration_ms: duration,
      response_body: `Error: ${error.message}`,
      created_at: new Date().toISOString()
    };
    
    logs.push(log);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to dispatch lead to all active integrations
async function dispatchLeadToAllAPIs(lead) {
  let successCount = 0;
  let failureCount = 0;
  
  // Try each integration
  for (const integration of REAL_INTEGRATIONS) {
    const result = await sendLeadToRealAPI(lead, integration);
    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  // Update lead status based on results
  const leadIndex = leads.findIndex(l => l.id === lead.id);
  if (leadIndex !== -1) {
    if (successCount > 0) {
      leads[leadIndex].status = 'sent';
      leads[leadIndex].sent_at = new Date().toISOString();
      leads[leadIndex].last_error = null;
    } else {
      leads[leadIndex].status = 'failed';
      leads[leadIndex].last_error = 'All integrations failed';
    }
    leads[leadIndex].attempts = (leads[leadIndex].attempts || 0) + 1;
  }
  
  return { successCount, failureCount };
}

// To use real APIs, replace the setTimeout simulation with:
// dispatchLeadToAllAPIs(lead);
