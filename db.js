require('dotenv').config();
const { Pool } = require('pg');

// Mock data store for when database is not available
let mockLeads = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    brand: 'demo',
    status: 'queued',
    created_at: new Date().toISOString(),
    ip: '192.168.1.1',
    userAgent: 'Mock Browser'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+0987654321',
    brand: 'demo',
    status: 'sent',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    ip: '192.168.1.2',
    userAgent: 'Mock Browser'
  }
];

let nextId = 3;
let dbAvailable = false;

// Try to create a real database connection
let pool;
try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    // Test the connection
    pool.query('SELECT NOW()').then(() => {
      dbAvailable = true;
      console.log('✅ PostgreSQL database connected');
    }).catch(() => {
      console.log('📦 Using mock database - PostgreSQL not available');
    });
  } else {
    console.log('📦 Using mock database - DATABASE_URL not configured');
  }
} catch (error) {
  console.log('📦 Using mock database - Database connection failed');
}

// Enhanced pool with fallback to mock data
const enhancedPool = {
  async query(text, params) {
    if (dbAvailable && pool) {
      try {
        return await pool.query(text, params);
      } catch (error) {
        console.log('Database query failed, falling back to mock data');
        dbAvailable = false;
      }
    }
    
    // Mock database operations
    return mockDatabaseQuery(text, params);
  }
};

function mockDatabaseQuery(text, params) {
  const query = text.toLowerCase();
  
  // Mock SELECT operations
  if (query.includes('select count(*) as count from leads')) {
    if (query.includes("status = 'sent'")) {
      return { rows: [{ count: mockLeads.filter(l => l.status === 'sent').length }] };
    } else if (query.includes("status = 'queued'")) {
      return { rows: [{ count: mockLeads.filter(l => l.status === 'queued').length }] };
    } else {
      return { rows: [{ count: mockLeads.length }] };
    }
  }
  
  if (query.includes('select * from leads order by created_at desc')) {
    const limit = params && params[0] ? parseInt(params[0]) : 50;
    const offset = params && params[1] ? parseInt(params[1]) : 0;
    const leads = mockLeads
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(offset, offset + limit);
    return { rows: leads };
  }
  
  if (query.includes('select * from leads where id = $1')) {
    const id = params[0];
    const lead = mockLeads.find(l => l.id == id);
    return { rows: lead ? [lead] : [] };
  }
  
  // Mock INSERT operations
  if (query.includes('insert into leads')) {
    const newLead = {
      id: nextId++,
      firstName: params[0] || 'Test',
      lastName: params[1] || 'User',
      email: params[2] || 'test@example.com',
      phone: params[3] || '+1234567890',
      brand: params[4] || 'demo',
      status: 'queued',
      created_at: new Date().toISOString(),
      ip: params[5] || '127.0.0.1',
      userAgent: params[6] || 'Mock Browser'
    };
    mockLeads.push(newLead);
    return { rows: [newLead] };
  }
  
  // Mock UPDATE operations
  if (query.includes('update leads set status = $1 where id = $2')) {
    const status = params[0];
    const id = params[1];
    const lead = mockLeads.find(l => l.id == id);
    if (lead) {
      lead.status = status;
      return { rows: [lead] };
    }
    return { rows: [] };
  }
  
  // Mock table creation and checks
  if (query.includes('create table') || query.includes('create index')) {
    return { rows: [] };
  }
  
  if (query.includes('select table_name from information_schema.tables')) {
    return { rows: [{ table_name: 'leads' }] };
  }
  
  // Mock status and connection tests
  if (query.includes('select now()')) {
    return { rows: [{ 
      current_time: new Date().toISOString(),
      pg_version: 'Mock PostgreSQL 15.0 (Mock Database)'
    }] };
  }
  
  // Default empty result
  return { rows: [] };
}

module.exports = enhancedPool;
