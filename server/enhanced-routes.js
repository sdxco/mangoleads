// Enhanced API Routes with Validation and Security
import express from 'express';
import { dispatchLead } from './enhanced-dispatcher.js';
import { 
  insertLead, 
  getAllLeads, 
  getLeadById, 
  deleteLead, 
  getLeadLogs,
  getActiveIntegrations 
} from './enhanced-db.js';
import { env } from './enhanced-env.js';

export const router = express.Router();

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map();

// Middleware: API Key Authentication
function requireApiKey(req, res, next) {
  const key = req.header('x-api-key');
  if (!key || key !== env.INTAKE_API_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Valid API key required' 
    });
  }
  next();
}

// Middleware: Admin Authentication (for admin endpoints)
function requireAdminKey(req, res, next) {
  const key = req.header('x-admin-key') || req.header('x-api-key');
  if (!key || (key !== env.ADMIN_API_KEY && key !== env.INTAKE_API_KEY)) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Admin access required' 
    });
  }
  next();
}

// Middleware: Rate Limiting
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - env.RATE_LIMIT_WINDOW_MS;
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }
  
  const requests = rateLimitStore.get(ip);
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (recentRequests.length >= env.RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Too many requests. Limit: ${env.RATE_LIMIT_MAX_REQUESTS} per ${env.RATE_LIMIT_WINDOW_MS / 1000} seconds`
    });
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  next();
}

// Middleware: Request Validation
function validateLeadData(req, res, next) {
  const { body } = req;
  const errors = [];

  // Required fields
  if (!body.first_name || body.first_name.trim() === '') {
    errors.push('first_name is required');
  }
  if (!body.email || body.email.trim() === '') {
    errors.push('email is required');
  }
  if (!body.country || body.country.trim() === '') {
    errors.push('country is required');
  }

  // Email validation
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('email must be valid');
  }

  // Country code validation (ISO-2)
  if (body.country && body.country.length !== 2) {
    errors.push('country must be 2-letter ISO code');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: env.NODE_ENV
  });
});

// Lead intake endpoint (public)
router.post('/leads/intake', rateLimit, requireApiKey, validateLeadData, async (req, res) => {
  try {
    console.log('📥 New lead intake:', req.body.email);
    
    const leadData = {
      ...req.body,
      user_ip: req.ip || req.connection.remoteAddress,
      created_at: new Date().toISOString()
    };

    const result = await insertLead(leadData);
    
    // Fire and forget dispatch (don't await to avoid timeout)
    dispatchLead(result.id).catch(error => {
      console.error(`Failed to dispatch lead ${result.id}:`, error.message);
    });

    res.status(201).json({
      success: true,
      id: result.id,
      message: 'Lead received and queued for processing'
    });

  } catch (error) {
    console.error('Lead intake error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: env.IS_DEVELOPMENT ? error.message : 'Failed to process lead'
    });
  }
});

// Get all leads (admin)
router.get('/leads', requireAdminKey, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const leads = await getAllLeads(limit, offset);
    
    res.json({
      success: true,
      data: leads,
      pagination: {
        limit,
        offset,
        total: leads.length
      }
    });

  } catch (error) {
    console.error('Get leads error:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve leads',
      message: env.IS_DEVELOPMENT ? error.message : 'Database error'
    });
  }
});

// Get single lead (admin)
router.get('/leads/:id', requireAdminKey, async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    if (isNaN(leadId)) {
      return res.status(400).json({
        error: 'Invalid lead ID',
        message: 'Lead ID must be a number'
      });
    }

    const lead = await getLeadById(leadId);
    if (!lead) {
      return res.status(404).json({
        error: 'Lead not found',
        message: `No lead found with ID ${leadId}`
      });
    }

    res.json({
      success: true,
      data: lead
    });

  } catch (error) {
    console.error('Get lead error:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve lead',
      message: env.IS_DEVELOPMENT ? error.message : 'Database error'
    });
  }
});

// Dispatch/redispatch lead (admin)
router.post('/leads/:id/dispatch', requireAdminKey, async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    if (isNaN(leadId)) {
      return res.status(400).json({
        error: 'Invalid lead ID',
        message: 'Lead ID must be a number'
      });
    }

    console.log(`🔄 Manual dispatch requested for lead ${leadId}`);
    
    const result = await dispatchLead(leadId, true); // Force retry
    
    res.json({
      success: true,
      data: result,
      message: `Lead dispatched: ${result.successes} successes, ${result.failures} failures`
    });

  } catch (error) {
    console.error('Dispatch error:', error.message);
    res.status(500).json({
      error: 'Failed to dispatch lead',
      message: env.IS_DEVELOPMENT ? error.message : 'Dispatch error'
    });
  }
});

// Get lead logs (admin)
router.get('/leads/:id/logs', requireAdminKey, async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    if (isNaN(leadId)) {
      return res.status(400).json({
        error: 'Invalid lead ID',
        message: 'Lead ID must be a number'
      });
    }

    const logs = await getLeadLogs(leadId);
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });

  } catch (error) {
    console.error('Get logs error:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve logs',
      message: env.IS_DEVELOPMENT ? error.message : 'Database error'
    });
  }
});

// Delete lead (admin)
router.delete('/leads/:id', requireAdminKey, async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    if (isNaN(leadId)) {
      return res.status(400).json({
        error: 'Invalid lead ID',
        message: 'Lead ID must be a number'
      });
    }

    // Check if lead exists
    const lead = await getLeadById(leadId);
    if (!lead) {
      return res.status(404).json({
        error: 'Lead not found',
        message: `No lead found with ID ${leadId}`
      });
    }

    await deleteLead(leadId);
    
    res.json({
      success: true,
      message: `Lead ${leadId} deleted successfully`
    });

  } catch (error) {
    console.error('Delete lead error:', error.message);
    res.status(500).json({
      error: 'Failed to delete lead',
      message: env.IS_DEVELOPMENT ? error.message : 'Database error'
    });
  }
});

// Get integrations (admin)
router.get('/integrations', requireAdminKey, async (req, res) => {
  try {
    const integrations = await getActiveIntegrations();
    
    res.json({
      success: true,
      data: integrations,
      count: integrations.length
    });

  } catch (error) {
    console.error('Get integrations error:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve integrations',
      message: env.IS_DEVELOPMENT ? error.message : 'Database error'
    });
  }
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  const docs = {
    title: 'MangoLeads v2 API',
    version: '2.0.0',
    endpoints: {
      'GET /api/health': 'Health check',
      'POST /api/leads/intake': 'Submit new lead (requires x-api-key)',
      'GET /api/leads': 'List all leads (requires x-admin-key)',
      'GET /api/leads/:id': 'Get single lead (requires x-admin-key)',
      'POST /api/leads/:id/dispatch': 'Dispatch/redispatch lead (requires x-admin-key)',
      'GET /api/leads/:id/logs': 'Get lead logs (requires x-admin-key)',
      'DELETE /api/leads/:id': 'Delete lead (requires x-admin-key)',
      'GET /api/integrations': 'List integrations (requires x-admin-key)'
    },
    authentication: {
      intake: 'x-api-key header',
      admin: 'x-admin-key header'
    },
    rateLimits: {
      window: `${env.RATE_LIMIT_WINDOW_MS / 1000} seconds`,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS
    }
  };

  res.json(docs);
});

// Error handler middleware
router.use((error, req, res, next) => {
  console.error('API Error:', error.message);
  
  res.status(500).json({
    error: 'Internal server error',
    message: env.IS_DEVELOPMENT ? error.message : 'Something went wrong'
  });
});

export default router;
