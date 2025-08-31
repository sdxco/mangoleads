// Enhanced Database Layer with Multiple Driver Support
import pkg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { env } from './enhanced-env.js';

const { Pool } = pkg;

// Database connection management
let pool = null;
let supabase = null;
let memoryStore = {
  leads: new Map(),
  brands: new Map(),
  integrations: new Map(),
  logs: new Map(),
  activities: new Map(),
  counters: { leads: 1, brands: 1000, integrations: 1, logs: 1, activities: 1 }
};

// Initialize database connection based on driver
function initializeDatabase() {
  if (env.DB_DRIVER === 'postgres' && env.DATABASE_URL) {
    pool = new Pool({ 
      connectionString: env.DATABASE_URL,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    console.log('✅ PostgreSQL connection initialized');
  } else if (env.DB_DRIVER === 'supabase' && env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false }
    });
    console.log('✅ Supabase connection initialized');
  } else {
    console.log('✅ Using in-memory storage (development mode)');
    initializeMemoryStore();
  }
}

// Initialize memory store with sample data
function initializeMemoryStore() {
  // Sample brands
  memoryStore.brands.set(1000, {
    id: 1000,
    name: 'Demo Trading Platform',
    active: true,
    description: 'Test trading platform integration',
    created_at: new Date().toISOString()
  });

  // Sample integrations
  memoryStore.integrations.set(1, {
    id: 1,
    brand_id: 1000,
    name: 'HTTPBin Demo',
    api_url: 'https://httpbin.org/post',
    method: 'POST',
    auth_type: 'none',
    field_mapping: {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      country: 'country'
    },
    required_fields: ['first_name', 'email', 'country'],
    active: true,
    created_at: new Date().toISOString()
  });
}

// Lead operations
export async function insertLead(leadData) {
  const lead = {
    first_name: leadData.first_name || leadData.name || '',
    last_name: leadData.last_name || '',
    email: leadData.email || '',
    phonecc: leadData.phonecc || '',
    phone: leadData.phone || '',
    country: leadData.country || '',
    user_ip: leadData.user_ip || leadData.ip || '',
    utm_source: leadData.utm_source || '',
    utm_medium: leadData.utm_medium || '',
    utm_campaign: leadData.utm_campaign || '',
    brand: leadData.brand || '',
    status: 'queued',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (env.DB_DRIVER === 'postgres' && pool) {
    const query = `
      INSERT INTO leads (first_name, last_name, email, phonecc, phone, country, user_ip, utm_source, utm_medium, utm_campaign, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'queued')
      RETURNING id
    `;
    const values = [lead.first_name, lead.last_name, lead.email, lead.phonecc, lead.phone, lead.country, lead.user_ip, lead.utm_source, lead.utm_medium, lead.utm_campaign];
    const { rows } = await pool.query(query, values);
    return { id: rows[0].id };
  } else if (env.DB_DRIVER === 'supabase' && supabase) {
    const { data, error } = await supabase.from('leads').insert(lead).select('id').single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data;
  } else {
    // Memory store
    const id = memoryStore.counters.leads++;
    const newLead = { id, ...lead };
    memoryStore.leads.set(id, newLead);
    return { id };
  }
}

export async function getLeadById(id) {
  if (env.DB_DRIVER === 'postgres' && pool) {
    const { rows } = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    return rows[0] || null;
  } else if (env.DB_DRIVER === 'supabase' && supabase) {
    const { data } = await supabase.from('leads').select('*').eq('id', id).single();
    return data;
  } else {
    return memoryStore.leads.get(Number(id)) || null;
  }
}

export async function getAllLeads(limit = 100, offset = 0) {
  if (env.DB_DRIVER === 'postgres' && pool) {
    const { rows } = await pool.query('SELECT * FROM leads ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    return rows;
  } else if (env.DB_DRIVER === 'supabase' && supabase) {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    return data || [];
  } else {
    return Array.from(memoryStore.leads.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(offset, offset + limit);
  }
}

export async function updateLeadStatus(id, status) {
  const updated_at = new Date().toISOString();
  
  if (env.DB_DRIVER === 'postgres' && pool) {
    await pool.query('UPDATE leads SET status = $1, updated_at = $2 WHERE id = $3', [status, updated_at, id]);
  } else if (env.DB_DRIVER === 'supabase' && supabase) {
    await supabase.from('leads').update({ status, updated_at }).eq('id', id);
  } else {
    const lead = memoryStore.leads.get(Number(id));
    if (lead) {
      lead.status = status;
      lead.updated_at = updated_at;
    }
  }
}

export async function deleteLead(id) {
  if (env.DB_DRIVER === 'postgres' && pool) {
    await pool.query('DELETE FROM leads WHERE id = $1', [id]);
  } else if (env.DB_DRIVER === 'supabase' && supabase) {
    await supabase.from('leads').delete().eq('id', id);
  } else {
    memoryStore.leads.delete(Number(id));
  }
}

// Integration operations
export async function getActiveIntegrations() {
  if (env.DB_DRIVER === 'postgres' && pool) {
    const { rows } = await pool.query('SELECT * FROM integrations WHERE active = true ORDER BY priority ASC');
    return rows;
  } else if (env.DB_DRIVER === 'supabase' && supabase) {
    const { data } = await supabase.from('integrations').select('*').eq('active', true).order('priority');
    return data || [];
  } else {
    return Array.from(memoryStore.integrations.values()).filter(i => i.active);
  }
}

// Log operations
export async function insertIntegrationLog(logData) {
  const log = {
    lead_id: logData.lead_id,
    integration_id: logData.integration_id,
    status: logData.status,
    http_code: logData.http_code,
    duration_ms: logData.duration_ms,
    response_body: logData.response_body || '',
    created_at: new Date().toISOString()
  };

  if (env.DB_DRIVER === 'postgres' && pool) {
    const query = `
      INSERT INTO integration_logs (lead_id, integration_id, status, http_code, duration_ms, response_body)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const values = [log.lead_id, log.integration_id, log.status, log.http_code, log.duration_ms, log.response_body];
    const { rows } = await pool.query(query, values);
    return { id: rows[0].id };
  } else if (env.DB_DRIVER === 'supabase' && supabase) {
    const { data, error } = await supabase.from('integration_logs').insert(log).select('id').single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data;
  } else {
    const id = memoryStore.counters.logs++;
    const newLog = { id, ...log };
    memoryStore.logs.set(id, newLog);
    return { id };
  }
}

export async function getLeadLogs(leadId, limit = 50) {
  if (env.DB_DRIVER === 'postgres' && pool) {
    const { rows } = await pool.query(
      'SELECT * FROM integration_logs WHERE lead_id = $1 ORDER BY created_at DESC LIMIT $2',
      [leadId, limit]
    );
    return rows;
  } else if (env.DB_DRIVER === 'supabase' && supabase) {
    const { data } = await supabase.from('integration_logs')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  } else {
    return Array.from(memoryStore.logs.values())
      .filter(log => log.lead_id === Number(leadId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }
}

// Initialize database on module load
initializeDatabase();

export { memoryStore };
