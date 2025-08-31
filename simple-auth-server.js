const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

console.log('🚀 Starting MangoLeads CRM - Simple Version...');

// Simple auth data
const users = {
  'admin': {
    id: 'admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    firstName: 'System',
    lastName: 'Administrator'
  },
  'affiliate1': {
    id: 'aff_001',
    username: 'affiliate1', 
    password: 'aff123',
    role: 'affiliate',
    firstName: 'John',
    lastName: 'Smith'
  },
  'affiliate2': {
    id: 'aff_002',
    username: 'affiliate2',
    password: 'aff123', 
    role: 'affiliate',
    firstName: 'Sarah',
    lastName: 'Johnson'
  }
};

const sessions = new Map();

// Generate simple token
function generateToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    let urlPath = req.url.split('?')[0];
    
    // Login endpoint
    if (urlPath === '/api/auth/login' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const user = users[data.username];
          
          if (user && user.password === data.password) {
            const token = generateToken();
            sessions.set(token, {
              userId: user.id,
              username: user.username,
              role: user.role,
              expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            });
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              token: token,
              user: {
                id: user.id,
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
              }
            }));
          } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
          }
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Invalid request' }));
        }
      });
      return;
    }

    // Validate token
    if (urlPath === '/api/auth/validate' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;
      
      if (!token || !sessions.has(token)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: false, message: 'Invalid token' }));
        return;
      }

      const session = sessions.get(token);
      if (Date.now() > session.expiresAt) {
        sessions.delete(token);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: false, message: 'Token expired' }));
        return;
      }

      const user = users[session.username];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }));
      return;
    }

    // Logout
    if (urlPath === '/api/auth/logout' && req.method === 'POST') {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;
      if (token) {
        sessions.delete(token);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // Health check
    if (urlPath === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        server: 'simple-auth',
        sessions: sessions.size
      }));
      return;
    }

    // Stats endpoint
    if (urlPath === '/api/stats') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        total: 2,
        sent: 1,
        queued: 1,
        active_brands: 1,
        total_affiliates: 2,
        active_affiliates: 2,
        total_commissions: 8341.25,
        pending_commissions: 1950.00
      }));
      return;
    }

    // Leads endpoint
    if (urlPath === '/api/leads') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        leads: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            brand: 'demo',
            status: 'queued',
            affiliateId: 'aff_001',
            affiliateCode: 'AFF001',
            commission: 25.00,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+0987654321',
            brand: 'demo', 
            status: 'sent',
            affiliateId: 'aff_002',
            affiliateCode: 'AFF002',
            commission: 30.00,
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      }));
      return;
    }

    // Affiliates endpoint
    if (urlPath === '/api/affiliates') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        affiliates: [
          {
            id: 'aff_001',
            username: 'affiliate1',
            firstName: 'John',
            lastName: 'Smith',
            companyName: 'Digital Marketing Pro',
            affiliateCode: 'AFF001',
            commissionRate: 15,
            totalCommissions: 2450.50,
            pendingCommissions: 750.00,
            totalLeads: 125,
            convertedLeads: 38,
            conversionRate: 30.4,
            isActive: true
          },
          {
            id: 'aff_002',
            username: 'affiliate2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            companyName: 'Traffic Queen Media',
            affiliateCode: 'AFF002',
            commissionRate: 20,
            totalCommissions: 5890.75,
            pendingCommissions: 1200.00,
            totalLeads: 280,
            convertedLeads: 84,
            conversionRate: 30.0,
            isActive: true
          }
        ]
      }));
      return;
    }

    // Brands endpoint
    if (urlPath === '/api/brands') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([
        {
          id: 'demo',
          name: 'Demo Trading Platform',
          active: true,
          type: 'demo',
          description: 'Demo brand for testing and development'
        }
      ]));
      return;
    }

    // Serve static files
    if (urlPath === '/' || urlPath === '/index.html') {
      // Always serve login page for root route
      urlPath = '/login.html';
    }
    
    const filePath = path.join(__dirname, 'public', urlPath);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'text/plain';
      
      switch (ext) {
        case '.html': contentType = 'text/html'; break;
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': case '.jpeg': contentType = 'image/jpeg'; break;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>404 - Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .container { max-width: 400px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; }
          h1 { color: #fff; margin-bottom: 20px; }
          .btn { background: #fff; color: #667eea; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🥭 MangoLeads CRM</h1>
          <h2>404 - Page Not Found</h2>
          <p>The requested page was not found.</p>
          <a href="/" class="btn">Go to Login</a>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('❌ Request error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

// Start server
server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  
  console.log('');
  console.log('🥭 MangoLeads CRM - Simple Auth Server');
  console.log('=====================================');
  console.log(`✅ Status: RUNNING`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔐 Login: http://localhost:${PORT}/login.html`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log('=====================================');
  console.log('👤 Admin Login: admin / admin123');
  console.log('👥 Affiliate Login: affiliate1 / aff123');
  console.log('👥 Affiliate Login: affiliate2 / aff123');
  console.log('=====================================');
  console.log('🎯 Server is ready!');
  console.log('💡 Press Ctrl+C to stop');
  console.log('');
});

// Error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use!`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
  }
});

console.log('📡 Setting up simple auth server...');
