require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const axios = require('axios');
const validator = require('validator');
const pool = require('./db');
const queue = require('./queue');
const { getBrand, getActiveBrands, validateLeadData } = require('./brands-config');

// Generate unique user ID for each client
function generateUniqueUserId() {
  const timestamp = Date.now().toString(36); // Base36 timestamp
  const randomPart = Math.random().toString(36).substring(2, 8); // Random string
  return `USER_${timestamp}_${randomPart}`.toUpperCase();
}

// Clean IP address to remove IPv6 prefix
function cleanIPAddress(ip) {
  if (!ip) return null;
  
  // Remove IPv6 prefix (::ffff:) if present
  if (ip.includes('::ffff:')) {
    return ip.replace('::ffff:', '');
  }
  
  // Handle comma-separated IPs (x-forwarded-for)
  if (ip.includes(',')) {
    return ip.split(',')[0].trim();
  }
  
  return ip;
}

// Auto-initialize database on startup
async function initializeDatabase() {
  try {
    console.log('🚀 Initializing MangoLeads database v2...');
    
    // Create leads table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id            BIGSERIAL PRIMARY KEY,
        first_name    VARCHAR(50) NOT NULL,
        last_name     VARCHAR(50) NOT NULL,
        email         VARCHAR(255) NOT NULL,
        phonecc       VARCHAR(5)  NOT NULL,
        phone         VARCHAR(14) NOT NULL,
        country       CHAR(2)     NOT NULL,
        referer       TEXT,
        user_ip       INET,
        user_id       VARCHAR(50),
        aff_id        VARCHAR(20) NOT NULL,
        offer_id      VARCHAR(10) NOT NULL,
        brand_id      VARCHAR(50),
        brand_name    VARCHAR(100),
        tracker_url   TEXT,
        aff_sub       TEXT,
        aff_sub2      TEXT,
        aff_sub3      TEXT,
        aff_sub4      TEXT,
        aff_sub5      TEXT,
        orig_offer    TEXT,
        status        TEXT CHECK (status IN ('queued','sent','error','processing','new','call_again','no_answer','not_interested','converted','wrong_number','wrong_info')) DEFAULT 'new',
        api_status    TEXT CHECK (api_status IN ('pending','sent','failed')) DEFAULT 'pending',
        attempts      SMALLINT DEFAULT 0,
        last_error    TEXT,
        sent_at       TIMESTAMPTZ,
        converted_at  TIMESTAMPTZ,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);
      CREATE INDEX IF NOT EXISTS leads_brand_idx ON leads (brand_id);
      CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);
      CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);
    `);
    
    // Add api_status column if it doesn't exist (migration)
    try {
      await pool.query(`
        ALTER TABLE leads 
        ADD COLUMN IF NOT EXISTS api_status TEXT 
        CHECK (api_status IN ('pending','sent','failed')) 
        DEFAULT 'pending'
      `);
      console.log('✅ API status column migration completed');
    } catch (migrationError) {
      console.log('ℹ️ API status column already exists or migration skipped');
    }
    
    // Check if table was created successfully
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'leads'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Database initialized successfully - leads table ready');
    } else {
      console.log('❌ Database initialization failed - table not created');
    }
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.log('🔄 Server will continue, but database operations may fail');
  }
}

// Initialize database immediately
initializeDatabase();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(cors());
app.use(rateLimit({ windowMs: 60_000, max: 30 }));

// Serve static files from public directory
app.use(express.static('public'));

const required = f => (typeof f === 'string' && f.trim().length);

// Dashboard endpoints
app.get('/status', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

app.get('/stats', async (req, res) => {
  try {
    const totalLeads = await pool.query('SELECT COUNT(*) as count FROM leads');
    const sentLeads = await pool.query("SELECT COUNT(*) as count FROM leads WHERE status = 'sent'");
    const queuedLeads = await pool.query("SELECT COUNT(*) as count FROM leads WHERE status = 'queued'");
    const activeBrands = getActiveBrands().length;

    res.json({
      totalLeads: parseInt(totalLeads.rows[0].count),
      sentLeads: parseInt(sentLeads.rows[0].count),
      queuedLeads: parseInt(queuedLeads.rows[0].count),
      activeBrands
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/leads', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const result = await pool.query(
      'SELECT * FROM leads ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({ leads: result.rows });
  } catch (error) {
    console.error('Leads fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.get('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Lead fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Update lead status endpoint
app.patch('/api/leads/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['new', 'queued', 'sent', 'error', 'processing', 'call_again', 'no_answer', 'not_interested', 'converted', 'wrong_number', 'wrong_info'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // Update the lead status
    const updateQuery = status === 'converted' 
      ? 'UPDATE leads SET status = $1, converted_at = NOW() WHERE id = $2 RETURNING *'
      : 'UPDATE leads SET status = $1 WHERE id = $2 RETURNING *';
      
    const result = await pool.query(updateQuery, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({
      success: true,
      lead: result.rows[0],
      message: `Lead status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Lead status update error:', error);
    res.status(500).json({ error: 'Failed to update lead status' });
  }
});

app.get('/brands', (req, res) => {
  const brands = getActiveBrands().map(brand => ({
    id: brand.id,
    name: brand.name,
    active: brand.active,
    api_url: brand.apiUrl,
    required_fields: brand.required_fields,
    country_restrictions: brand.country_restrictions || []
  }));
  res.json(brands);
});

app.get('/analytics', async (req, res) => {
  try {
    // Brand statistics
    const brandStats = await pool.query(`
      SELECT 
        brand_id,
        brand_name,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_leads,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error_leads
      FROM leads 
      GROUP BY brand_id, brand_name
      ORDER BY total_leads DESC
    `);

    // Status distribution
    const statusStats = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM leads 
      GROUP BY status
    `);

    res.json({
      brandStats: brandStats.rows,
      statusStats: statusStats.rows
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// New API endpoint for lead submission (cleaner than submit-lead)
app.post('/api/leads', async (req, res) => {
  try {
    const { 
      brand_id, 
      brand_name,
      first_name, 
      last_name, 
      email, 
      phonecc,
      phone, 
      country,
      aff_id,
      offer_id,
      user_ip,
      aff_sub,
      referer
    } = req.body;

    // Validate brand_id is provided
    if (!brand_id) {
      return res.status(400).json({ error: 'brand_id is required' });
    }

    // Get brand configuration
    const brand = getBrand(brand_id);
    if (!brand) {
      return res.status(400).json({ error: 'Invalid brand_id' });
    }

    if (!brand.active) {
      return res.status(400).json({ error: 'Brand is currently inactive' });
    }

    // Validate required fields for this brand
    const leadData = { first_name, last_name, email, phonecc, phone, country };
    const missingFields = validateLeadData(leadData, brand);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missing_fields: missingFields
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get client IP if not provided
    const rawIP = user_ip || req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const clientIP = cleanIPAddress(rawIP);

    // Generate unique user ID for this lead
    const uniqueUserId = generateUniqueUserId();

    // Store lead in database
    const result = await pool.query(
      `INSERT INTO leads (
        first_name, last_name, email, phonecc, phone, country, 
        brand_id, brand_name, aff_id, offer_id, user_ip, user_id, aff_sub, 
        referer, tracker_url, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
      RETURNING id`,
      [
        first_name, last_name, email, phonecc, phone, country, 
        brand_id, brand_name || brand.name, aff_id || brand.affId, 
        offer_id || brand.offerId, clientIP, uniqueUserId, aff_sub || '', 
        referer || '', brand.trackerUrl || '', 'queued', new Date()
      ]
    );

    const leadId = result.rows[0].id;

    // Add to queue for processing
    await queue.add('send', { 
      id: leadId, 
      ...leadData, 
      brand_id, 
      brand_name: brand_name || brand.name,
      aff_id: aff_id || brand.affId,
      offer_id: offer_id || brand.offerId,
      user_ip: clientIP,
      aff_sub: aff_sub || '',
      referer: referer || ''
    });

    res.status(201).json({
      leadId: leadId,
      status: 'queued',
      brand: brand_name || brand.name,
      brand_id: brand_id
    });

  } catch (error) {
    console.error('Lead submission error:', error);
    res.status(500).json({ error: 'Failed to submit lead' });
  }
});

app.get('/health', (_, res) => res.send('OK'));

// Simple database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time, COUNT(*) as count FROM leads');
    res.json({
      status: 'success',
      database_connected: true,
      current_time: result.rows[0].time,
      leads_count: result.rows[0].count
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database_connected: false,
      error: error.message,
      error_code: error.code
    });
  }
});

// Database debug endpoint
app.get('/debug/database', async (req, res) => {
  try {
    // Test database connection
    const connectionTest = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    
    // Check if leads table exists
    const tableCheck = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'leads'
      ORDER BY ordinal_position
    `);
    
    // Count existing leads
    let leadsCount = 0;
    let sampleLead = null;
    try {
      const countResult = await pool.query('SELECT COUNT(*) as count FROM leads');
      leadsCount = countResult.rows[0].count;
      
      if (leadsCount > 0) {
        const sampleResult = await pool.query('SELECT * FROM leads ORDER BY created_at DESC LIMIT 1');
        sampleLead = sampleResult.rows[0];
      }
    } catch (err) {
      console.log('Error counting leads:', err.message);
    }
    
    res.json({
      status: 'connected',
      database_url_configured: !!process.env.DATABASE_URL,
      current_time: connectionTest.rows[0].current_time,
      postgres_version: connectionTest.rows[0].pg_version,
      leads_table_exists: tableCheck.rows.length > 0,
      table_columns: tableCheck.rows.length,
      leads_count: leadsCount,
      sample_lead: sampleLead,
      environment: process.env.NODE_ENV || 'development'
    });
    
  } catch (error) {
    console.error('Database debug error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      code: error.code,
      database_url_configured: !!process.env.DATABASE_URL
    });
  }
});

// Manual database setup endpoint
app.get('/setup-database', async (req, res) => {
  try {
    console.log('🔧 Manual database setup triggered...');
    
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL environment variable is not configured. Please add your PostgreSQL connection string to Railway variables.',
        help: 'Go to Railway dashboard → Your service → Variables tab → Add DATABASE_URL',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('Database URL configured, attempting connection...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id            BIGSERIAL PRIMARY KEY,
        first_name    VARCHAR(50) NOT NULL,
        last_name     VARCHAR(50) NOT NULL,
        email         VARCHAR(255) NOT NULL,
        phonecc       VARCHAR(5)  NOT NULL,
        phone         VARCHAR(14) NOT NULL,
        country       CHAR(2)     NOT NULL,
        referer       TEXT,
        user_ip       INET,
        user_id       VARCHAR(50),
        aff_id        VARCHAR(20) NOT NULL,
        offer_id      VARCHAR(10) NOT NULL,
        brand_id      VARCHAR(50),
        brand_name    VARCHAR(100),
        tracker_url   TEXT,
        aff_sub       TEXT,
        aff_sub2      TEXT,
        aff_sub3      TEXT,
        aff_sub4      TEXT,
        aff_sub5      TEXT,
        orig_offer    TEXT,
        status        TEXT CHECK (status IN ('queued','sent','error','processing','new','call_again','no_answer','not_interested','converted','wrong_number','wrong_info')) DEFAULT 'new',
        api_status    TEXT CHECK (api_status IN ('pending','sent','failed')) DEFAULT 'pending',
        attempts      SMALLINT DEFAULT 0,
        last_error    TEXT,
        sent_at       TIMESTAMPTZ,
        converted_at  TIMESTAMPTZ,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    console.log('Table creation successful, creating indexes...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);
      CREATE INDEX IF NOT EXISTS leads_brand_idx ON leads (brand_id);
      CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);
      CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);
    `);
    
    // Verify table was created
    const verifyResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'leads'
    `);
    
    console.log('✅ Database setup completed successfully');
    
    res.json({
      success: true,
      message: 'Database table created successfully!',
      table_exists: verifyResult.rows.length > 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      error_code: error.code,
      database_url_configured: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/submit-lead', async (req, res) => {
  try {
    const {
      brand_id, first_name, last_name, email, phonecc, phone, country, age, referer,
      aff_sub, aff_sub2, aff_sub4, aff_sub5, orig_offer
    } = req.body;

    // Validate brand_id is provided
    if (!brand_id) {
      return res.status(400).json({ error: 'brand_id is required' });
    }

    // Get brand configuration
    const brand = getBrand(brand_id);
    if (!brand) {
      return res.status(400).json({ error: 'Invalid brand_id' });
    }

    if (!brand.active) {
      return res.status(400).json({ error: 'Brand is currently inactive' });
    }

    // Validate required fields for this brand
    const leadData = { first_name, last_name, email, phonecc, phone, country, age };
    const missingFields = validateLeadData(leadData, brand);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missing: missingFields,
        brand: brand.name
      });
    }

    // Basic field validation
    if (
      !validator.isEmail(email) ||
      !validator.isISO31661Alpha2(country) ||
      !validator.matches(phonecc, /^\+\d{1,4}$/) ||
      !validator.matches(phone, /^\d{4,14}$/) ||
      (age && (!Number.isInteger(Number(age)) || age < 18 || age > 100))
    ) {
      return res.status(400).json({ error: 'Invalid field format' });
    }

    const rawIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const user_ip = cleanIPAddress(rawIP);

    // Generate unique user ID for this lead
    const uniqueUserId = generateUniqueUserId();

    // Insert lead with brand information
    const { rows } = await pool.query(
      `INSERT INTO leads
       (first_name,last_name,email,phonecc,phone,country,age,referer,user_ip,user_id,
        brand_id,brand_name,tracker_url,aff_id,offer_id,aff_sub,aff_sub2,aff_sub3,aff_sub4,aff_sub5,orig_offer)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
       RETURNING *`,
      [first_name, last_name, email, phonecc, phone, country, age || null, referer || null, user_ip, uniqueUserId,
       brand_id, brand.name, brand.trackerUrl, brand.affId, brand.offerId,
       aff_sub, aff_sub2, process.env.LANDING_DOMAIN, aff_sub4, aff_sub5, orig_offer]
    );

    const lead = rows[0];
    await queue.add('send', { ...lead, brand });

    res.status(202).json({ 
      id: lead.id, 
      status: 'queued',
      brand: brand.name,
      brand_id: brand_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// API Integration Management Endpoints

// Get all brand integrations
app.get('/api/integrations', (req, res) => {
  const brands = getActiveBrands().map(brand => ({
    id: brand.id,
    name: brand.name,
    active: brand.active,
    type: brand.type,
    api_url: brand.apiUrl,
    tracker_url: brand.trackerUrl,
    aff_id: brand.affId,
    offer_id: brand.offerId,
    required_fields: brand.required_fields,
    country_restrictions: brand.country_restrictions || [],
    has_token: !!brand.token,
    method: brand.method || 'POST',
    format: brand.format || 'json'
  }));
  res.json(brands);
});

// Test an API integration
app.post('/api/integrations/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const brand = getBrand(id);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Create test lead data
    const testLead = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phonecc: '+1',
      phone: '5551234567',
      country: 'US',
      user_ip: '127.0.0.1',
      user_id: generateUniqueUserId(),
      aff_id: brand.affId,
      offer_id: brand.offerId,
      aff_sub: 'test',
      aff_sub2: 'crm_test',
      aff_sub3: process.env.LANDING_DOMAIN || 'mangoleads.com'
    };

    // Configure request headers
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'MangoLeads-CRM-Test/1.0'
    };

    if (brand.token) {
      headers['Authorization'] = `Bearer ${brand.token}`;
    }

    let response;
    let success = false;
    let errorMessage = '';

    try {
      // Try the API call
      if (brand.method === 'GET') {
        const qs = new URLSearchParams(testLead);
        response = await axios.get(`${brand.trackerUrl}?${qs.toString()}`, { 
          headers,
          timeout: 10000 
        });
      } else {
        response = await axios.post(brand.trackerUrl, testLead, { 
          headers,
          timeout: 10000,
          params: {
            offer_id: brand.offerId,
            aff_id: brand.affId
          }
        });
      }
      
      success = response.status >= 200 && response.status < 300;
      
    } catch (error) {
      errorMessage = error.message;
      if (error.response) {
        errorMessage += ` (Status: ${error.response.status})`;
        if (error.response.data) {
          errorMessage += ` - ${JSON.stringify(error.response.data)}`;
        }
      }
    }

    res.json({
      brand_id: id,
      brand_name: brand.name,
      success,
      status_code: response?.status || 0,
      response_data: response?.data || null,
      error: errorMessage || null,
      test_data: testLead,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Integration test error:', error);
    res.status(500).json({ error: 'Failed to test integration' });
  }
});

// Add new brand integration (generates configuration)
app.post('/api/integrations', async (req, res) => {
  try {
    const {
      name,
      api_url,
      tracker_url,
      aff_id,
      offer_id,
      token,
      method,
      required_fields,
      country_restrictions,
      active
    } = req.body;

    // Validate required fields
    if (!name || !tracker_url || !aff_id || !offer_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, tracker_url, aff_id, offer_id' 
      });
    }

    // Generate new brand ID
    const newId = offer_id; // Use offer_id as brand ID

    // Create new brand configuration
    const newBrand = {
      id: newId,
      name,
      active: active !== false,
      type: 'live',
      apiUrl: api_url || tracker_url,
      trackerUrl: tracker_url,
      affId: aff_id,
      offerId: offer_id,
      token: token || null,
      method: method || 'POST',
      format: 'json',
      required_fields: required_fields || ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country'],
      country_restrictions: country_restrictions || []
    };

    res.status(201).json({
      success: true,
      message: 'Brand integration configuration generated successfully',
      brand: newBrand,
      instructions: {
        step1: 'Copy the brand configuration below',
        step2: 'Add it to your brands-config.js file in the brands array',
        step3: 'Redeploy your application',
        step4: 'The integration will be active and ready to receive leads'
      }
    });

  } catch (error) {
    console.error('Add integration error:', error);
    res.status(500).json({ error: 'Failed to add integration' });
  }
});

// Delete/deactivate brand integration
app.delete('/api/integrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const brand = getBrand(id);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    let hasLeads = false;
    let leadCount = 0;

    // Check if brand has existing leads (only if database is available)
    try {
      const leadsCount = await pool.query(
        'SELECT COUNT(*) as count FROM leads WHERE brand_id = $1',
        [id]
      );
      leadCount = parseInt(leadsCount.rows[0].count);
      hasLeads = leadCount > 0;
    } catch (dbError) {
      console.log('Database not available for lead count check, proceeding without lead validation');
      // Continue without database check
    }

    res.json({
      success: true,
      message: hasLeads 
        ? 'Brand removal configuration generated. Note: This brand has existing leads in the database.'
        : 'Brand removal configuration generated.',
      brand_id: id,
      brand_name: brand.name,
      existing_leads: leadCount,
      warning: hasLeads ? 'Removing this brand will not delete existing lead data, but will prevent new leads from being processed.' : null,
      instructions: {
        step1: 'Remove the brand configuration from brands-config.js',
        step2: 'Redeploy your application',
        step3: hasLeads ? 'Existing leads will remain in database for historical records' : 'Brand will be completely removed'
      }
    });

  } catch (error) {
    console.error('Delete integration error:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
});

// Toggle brand activation status
app.patch('/api/integrations/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const brand = getBrand(id);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const newStatus = !brand.active;

    res.json({
      success: true,
      message: `Brand ${newStatus ? 'activation' : 'deactivation'} configuration generated`,
      brand_id: id,
      brand_name: brand.name,
      current_status: brand.active,
      new_status: newStatus,
      instructions: {
        step1: `Update the 'active' property to ${newStatus} in brands-config.js`,
        step2: 'Redeploy your application',
        step3: newStatus ? 'Brand will start accepting new leads' : 'Brand will stop accepting new leads'
      }
    });

  } catch (error) {
    console.error('Toggle integration error:', error);
    res.status(500).json({ error: 'Failed to toggle integration' });
  }
});

// Test lead submission endpoint
app.post('/api/test-lead', async (req, res) => {
  try {
    const { brandId } = req.body;
    
    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID is required' });
    }

    const brand = getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    if (!brand.active) {
      return res.status(400).json({ error: 'Brand is currently inactive' });
    }

    // Generate test lead data
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
    const testData = {
      email: `test.lead.${timestamp}@mangoleads.com`,
      firstName: 'John',
      lastName: 'TestUser',
      phonecc: '+1',
      phone: '5551234567',
      ip: '192.168.1.100',
      country: 'United States',
      fname: 'John',
      lname: 'TestUser',
      first_name: 'John',
      last_name: 'TestUser'
    };

    // Generate unique lead ID
    const leadId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert test lead into database
    const insertQuery = `
      INSERT INTO leads (
        lead_id, brand_id, brand_name, email, first_name, last_name, 
        phone, phonecc, ip, country, call_status, api_status, 
        created_at, sent_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
      ) RETURNING id
    `;

    const insertResult = await db.query(insertQuery, [
      leadId,
      brandId,
      brand.name,
      testData.email,
      testData.firstName,
      testData.lastName,
      testData.phone,
      testData.phonecc,
      testData.ip,
      testData.country,
      'pending',
      'pending'
    ]);

    // Queue the lead for processing (simulate real lead flow)
    if (brand.webhook_url || brand.api_endpoint) {
      // Add to processing queue
      await queue.add('send', {
        ...testData,
        brand_id: brandId,
        brand_name: brand.name,
        lead_id: leadId,
        source: 'test_lead'
      });
    }

    res.json({
      success: true,
      message: 'Test lead created and queued successfully',
      leadId: leadId,
      brand_name: brand.name,
      status: 'queued_for_processing',
      testData: testData
    });

  } catch (error) {
    console.error('Test lead error:', error);
    res.status(500).json({ error: 'Failed to create test lead' });
  }
});

// Alias endpoint for brand toggle (same as integration toggle)
app.patch('/api/brands/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const brand = getBrand(id);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Toggle the status in memory (for runtime changes)
    const newStatus = brand.active ? 'inactive' : 'active';
    
    // Update in-memory brand status
    brandsConfig.brands[id] = {
      ...brand,
      active: newStatus === 'active'
    };

    res.json({
      success: true,
      message: `Brand ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      brand_id: id,
      brand_name: brand.name,
      newStatus: newStatus
    });

  } catch (error) {
    console.error('Toggle brand error:', error);
    res.status(500).json({ error: 'Failed to toggle brand status' });
  }
});

// Enhanced leads endpoint with brand filtering
app.get('/leads', async (req, res) => {
  try {
    const { brand_id, status, limit = 100 } = req.query;
    
    let query = 'SELECT id,brand_id,brand_name,email,status,attempts,created_at,sent_at FROM leads';
    const params = [];
    const conditions = [];

    if (brand_id) {
      conditions.push('brand_id = $' + (params.length + 1));
      params.push(brand_id);
    }

    if (status) {
      conditions.push('status = $' + (params.length + 1));
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC LIMIT $' + (params.length + 1);
    params.push(Math.min(parseInt(limit), 1000)); // Max 1000 results

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Get available brands
app.get('/brands', (req, res) => {
  const activeBrands = getActiveBrands();
  res.json(activeBrands);
});

// Get brand statistics
app.get('/brands/stats', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        brand_id,
        brand_name,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_leads,
        COUNT(CASE WHEN status = 'queued' THEN 1 END) as queued_leads,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error_leads,
        ROUND(COUNT(CASE WHEN status = 'sent' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
      FROM leads 
      GROUP BY brand_id, brand_name
      ORDER BY total_leads DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Enhanced queue processor with brand-specific processing
(async () => {
  const processFunc = async job => {
    const lead = job.data;
    
    try {
      // Get brand configuration
      const brand = getBrand(lead.brand_id);
      if (!brand) {
        throw new Error(`Brand ${lead.brand_id} not found`);
      }

      // Skip processing for mock brands
      if (brand.type === 'mock') {
        console.log(`📝 Mock brand ${lead.brand_id} - Lead ${lead.id} stored locally only`);
        await pool.query(
          'UPDATE leads SET status=$1, api_status=$2, sent_at=$3 WHERE id=$4', 
          ['new', 'sent', new Date(), lead.id]
        );
        return;
      }

      // Use brand-specific tracker URL
      const trackerUrl = brand.trackerUrl;
      
      if (!trackerUrl) {
        throw new Error('No tracker URL available for this brand');
      }

      console.log(`Sending lead ${lead.id} to ${brand.name} (${trackerUrl})`);
      
      // Prepare request data
      const leadData = {
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phonecc: lead.phonecc,
        phone: lead.phone,
        country: lead.country,
        age: lead.age || '',
        user_ip: lead.user_ip,
        user_id: lead.user_id,
        aff_sub: lead.aff_sub || '',
        aff_sub2: lead.aff_sub2 || '',
        aff_sub3: lead.aff_sub3 || process.env.LANDING_DOMAIN,
        aff_sub4: lead.aff_sub4 || '',
        aff_sub5: lead.aff_sub5 || '',
        aff_id: lead.aff_id,
        offer_id: lead.offer_id,
        brand_id: lead.brand_id
      };

      // Configure request headers
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'MangoLeads-CRM/1.0'
      };

      // Add JWT token if available
      if (brand.token) {
        headers['Authorization'] = `Bearer ${brand.token}`;
      }

      let response;
      
      // Try POST with JSON first (modern API)
      try {
        response = await axios.post(trackerUrl, leadData, { 
          headers,
          timeout: 10000,
          params: {
            offer_id: lead.offer_id,
            aff_id: lead.aff_id
          }
        });
      } catch (postError) {
        // Fallback to GET with query string (legacy API)
        console.log(`POST failed, trying GET fallback for lead ${lead.id}`);
        const qs = new URLSearchParams(leadData);
        response = await axios.get(`${trackerUrl}?${qs.toString()}`, { 
          headers,
          timeout: 10000 
        });
      }
      
      // Update lead as successfully sent to API
      await pool.query(
        'UPDATE leads SET api_status=$1, sent_at=$2 WHERE id=$3', 
        ['sent', new Date(), lead.id]
      );
      
      console.log(`✅ Lead ${lead.id} sent successfully to ${brand.name}`);
      
    } catch (err) {
      console.error(`❌ Failed to send lead ${lead.id}:`, err.message);
      
      const attempts = (lead.attempts || 0) + 1;
      const maxAttempts = 3;
      
      await pool.query(
        'UPDATE leads SET api_status=$1, attempts=$2, last_error=$3 WHERE id=$4',
        [attempts >= maxAttempts ? 'failed' : 'pending', attempts, err.message, lead.id]
      );
      
      // Retry with exponential backoff if under max attempts
      if (attempts < maxAttempts) {
        const delay = 1000 * Math.pow(2, attempts); // 2s, 4s, 8s delays
        console.log(`🔄 Retrying lead ${lead.id} in ${delay}ms (attempt ${attempts + 1}/${maxAttempts})`);
        await queue.add('send', lead, { delay });
      } else {
        console.log(`💀 Lead ${lead.id} failed permanently after ${maxAttempts} attempts`);
      }
      
      throw err; // Re-throw to mark job as failed
    }
  };

  if (queue.processLoop) {
    // in-memory
    queue.processLoop(processFunc);
  } else {
    // BullMQ
    const { Worker } = require('bullmq');
    new Worker('send', processFunc, { connection: { url: process.env.REDIS_URL } });
  }
})();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Lead-CRM listening on http://localhost:${PORT}`)
);

// Serve dashboard as default route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
