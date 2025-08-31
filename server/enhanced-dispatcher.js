// Enhanced Lead Dispatcher with Advanced Features
import axios from 'axios';
import { 
  getActiveIntegrations, 
  insertIntegrationLog, 
  updateLeadStatus, 
  getLeadById 
} from './enhanced-db.js';
import { env } from './enhanced-env.js';

// Rate limiting and retry logic
const integrationCalls = new Map(); // Track calls per integration
const retryQueue = new Map(); // Track retry attempts

export class DispatchError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'DispatchError';
    this.code = code;
    this.details = details;
  }
}

// Build payload with field mapping
function buildPayload(fieldMapping, lead) {
  const payload = {};
  
  // Apply field mapping
  for (const [externalField, internalField] of Object.entries(fieldMapping || {})) {
    if (lead[internalField] !== undefined) {
      payload[externalField] = lead[internalField];
    }
  }
  
  // Include original fields if not mapped
  const mappedInternalFields = new Set(Object.values(fieldMapping || {}));
  for (const [key, value] of Object.entries(lead)) {
    if (!mappedInternalFields.has(key) && !payload.hasOwnProperty(key)) {
      payload[key] = value;
    }
  }
  
  return payload;
}

// Build authentication headers
function buildAuthHeaders(integration) {
  const headers = { 'Content-Type': 'application/json' };
  
  switch (integration.auth_type) {
    case 'bearer':
      if (integration.auth_value) {
        headers['Authorization'] = `Bearer ${integration.auth_value}`;
      }
      break;
    case 'basic':
      if (integration.auth_value) {
        headers['Authorization'] = `Basic ${integration.auth_value}`;
      }
      break;
    case 'apiKeyHeader':
      if (integration.api_key_header && integration.auth_value) {
        headers[integration.api_key_header] = integration.auth_value;
      }
      break;
  }
  
  return headers;
}

// Validate required fields
function validateRequiredFields(lead, requiredFields) {
  const missing = [];
  for (const field of requiredFields || []) {
    if (!lead[field] || lead[field].toString().trim() === '') {
      missing.push(field);
    }
  }
  return missing;
}

// Send lead to a single integration
export async function sendLeadToIntegration(lead, integration, attemptNumber = 1) {
  const startTime = Date.now();
  const logData = {
    lead_id: lead.id,
    integration_id: integration.id,
    attempt_number: attemptNumber,
    status: 'failed',
    http_code: null,
    duration_ms: 0,
    response_body: ''
  };

  try {
    // Validate required fields
    const missingFields = validateRequiredFields(lead, integration.required_fields);
    if (missingFields.length > 0) {
      throw new DispatchError(
        `Missing required fields: ${missingFields.join(', ')}`,
        'VALIDATION_ERROR',
        { missingFields }
      );
    }

    // Build request
    const headers = buildAuthHeaders(integration);
    const payload = buildPayload(integration.field_mapping, lead);
    const timeout = integration.timeout_ms || 10000;

    console.log(`📤 Sending lead ${lead.id} to ${integration.name} (attempt ${attemptNumber})`);

    // Make HTTP request
    const response = await axios({
      url: integration.api_url,
      method: integration.method || 'POST',
      timeout,
      headers,
      data: integration.method?.toUpperCase() === 'GET' ? undefined : payload,
      params: integration.method?.toUpperCase() === 'GET' ? payload : undefined,
      validateStatus: () => true // Don't throw on non-2xx status
    });

    const duration = Date.now() - startTime;
    const success = response.status >= 200 && response.status < 300;

    // Log the attempt
    logData.status = success ? 'sent' : 'failed';
    logData.http_code = response.status;
    logData.duration_ms = duration;
    logData.response_body = typeof response.data === 'string' 
      ? response.data.slice(0, 5000)
      : JSON.stringify(response.data).slice(0, 5000);

    await insertIntegrationLog(logData);

    if (success) {
      console.log(`✅ Lead ${lead.id} sent successfully to ${integration.name} (${response.status})`);
      return { success: true, response, duration };
    } else {
      throw new DispatchError(
        `API returned ${response.status}: ${response.statusText}`,
        'API_ERROR',
        { status: response.status, data: response.data }
      );
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    logData.duration_ms = duration;
    logData.response_body = error.response?.data 
      ? JSON.stringify(error.response.data).slice(0, 5000)
      : error.message.slice(0, 5000);

    if (error.response) {
      logData.http_code = error.response.status;
    }

    await insertIntegrationLog(logData);

    console.log(`❌ Failed to send lead ${lead.id} to ${integration.name}: ${error.message}`);
    
    return { 
      success: false, 
      error: error.message, 
      shouldRetry: shouldRetryError(error, attemptNumber),
      duration 
    };
  }
}

// Determine if error should be retried
function shouldRetryError(error, attemptNumber) {
  if (attemptNumber >= env.MAX_RETRY_ATTEMPTS) return false;
  
  // Retry on network errors, timeouts, and 5xx responses
  if (error.code === 'ECONNRESET' || 
      error.code === 'ENOTFOUND' || 
      error.code === 'ETIMEDOUT' ||
      (error.response && error.response.status >= 500)) {
    return true;
  }
  
  return false;
}

// Dispatch lead to all active integrations
export async function dispatchLead(leadId, forceRetry = false) {
  try {
    const lead = await getLeadById(leadId);
    if (!lead) {
      throw new DispatchError('Lead not found', 'NOT_FOUND', { leadId });
    }

    console.log(`🚀 Dispatching lead ${leadId} (${lead.email})`);

    const integrations = await getActiveIntegrations();
    if (integrations.length === 0) {
      console.log('⚠️ No active integrations found');
      return { successes: 0, failures: 0, total: 0 };
    }

    let successes = 0;
    let failures = 0;
    const results = [];

    // Process each integration
    for (const integration of integrations) {
      const result = await sendLeadToIntegration(lead, integration);
      results.push({
        integration: integration.name,
        ...result
      });

      if (result.success) {
        successes++;
      } else {
        failures++;
        
        // Schedule retry if appropriate
        if (result.shouldRetry && !forceRetry) {
          scheduleRetry(leadId, integration.id, 1);
        }
      }
    }

    // Update lead status
    const finalStatus = successes > 0 ? 'sent' : 'failed';
    await updateLeadStatus(leadId, finalStatus);

    console.log(`📊 Lead ${leadId} dispatch complete: ${successes} successes, ${failures} failures`);

    return {
      successes,
      failures,
      total: integrations.length,
      results,
      finalStatus
    };

  } catch (error) {
    console.error(`💥 Failed to dispatch lead ${leadId}:`, error.message);
    await updateLeadStatus(leadId, 'failed');
    throw error;
  }
}

// Schedule retry for failed dispatch
function scheduleRetry(leadId, integrationId, attemptNumber) {
  const delay = env.RETRY_DELAY_MS * Math.pow(2, attemptNumber - 1); // Exponential backoff
  const retryKey = `${leadId}-${integrationId}`;
  
  console.log(`⏰ Scheduling retry for lead ${leadId} in ${delay}ms (attempt ${attemptNumber + 1})`);
  
  setTimeout(async () => {
    try {
      const lead = await getLeadById(leadId);
      const integrations = await getActiveIntegrations();
      const integration = integrations.find(i => i.id === integrationId);
      
      if (lead && integration) {
        const result = await sendLeadToIntegration(lead, integration, attemptNumber + 1);
        
        if (result.success) {
          console.log(`✅ Retry successful for lead ${leadId}`);
          await updateLeadStatus(leadId, 'sent');
        } else if (result.shouldRetry) {
          scheduleRetry(leadId, integrationId, attemptNumber + 1);
        }
      }
    } catch (error) {
      console.error(`💥 Retry failed for lead ${leadId}:`, error.message);
    }
  }, delay);
}

// Process queued leads (for cron job)
export async function processQueuedLeads(limit = 50) {
  try {
    // This would need to be implemented based on your database
    // For now, we'll just return success
    console.log('🔄 Processing queued leads...');
    return { processed: 0 };
  } catch (error) {
    console.error('💥 Failed to process queued leads:', error.message);
    throw error;
  }
}

// Get dispatch statistics
export async function getDispatchStats() {
  // This would query your database for statistics
  // For now, return mock data
  return {
    today: {
      total: 0,
      sent: 0,
      failed: 0,
      queued: 0
    },
    thisWeek: {
      total: 0,
      sent: 0,
      failed: 0,
      queued: 0
    }
  };
}
