const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const AuthSystem = require('./auth-system');

const PORT = 3000;
const auth = new AuthSystem();

console.log('🚀 Starting MangoLeads CRM with Authentication...');

// Mock database with enhanced lead data
const mockDatabase = {
  stats: {
    total: 2,
    sent: 1,
    queued: 1,
    active_brands: 1,
    total_affiliates: 2,
    active_affiliates: 2,
    total_commissions: 8341.25,
    pending_commissions: 1950.00
  },
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
      created_at: new Date().toISOString(),
      source: 'Facebook Ad Campaign'
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
      created_at: new Date(Date.now() - 86400000).toISOString(),
      source: 'Google Ads'
    }
  ]
};

// Helper function to parse POST data
function parsePostData(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
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
    
    // Authentication endpoints
    if (urlPath === '/api/auth/login' && req.method === 'POST') {
      const data = await parsePostData(req);
      const result = auth.login(data.username, data.password);
      
      res.writeHead(result.success ? 200 : 401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (urlPath === '/api/auth/logout' && req.method === 'POST') {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;
      
      if (token) {
        auth.logout(token);
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    if (urlPath === '/api/auth/validate' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;
      
      if (!token) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: false, message: 'No token provided' }));
        return;
      }

      const validation = auth.validateSession(token);
      res.writeHead(validation.valid ? 200 : 401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(validation));
      return;
    }

    // Protected endpoints - require authentication
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    // Allow access to login page and static files without authentication
    if (urlPath === '/login.html' || urlPath === '/login' || !urlPath.startsWith('/api/')) {
      // Serve static files or redirect to login
      if (urlPath === '/' || urlPath === '/index.html') {
        // Check if user is authenticated
        if (!token || !auth.validateSession(token).valid) {
          // Redirect to login
          const loginHtml = fs.readFileSync(path.join(__dirname, 'public', 'login.html'));
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(loginHtml);
          return;
        }
      }

      // Serve static files
      if (urlPath === '/') urlPath = '/index.html';
      
      const filePath = path.join(__dirname, 'public', urlPath);
      
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
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
            case '.gif': contentType = 'image/gif'; break;
            case '.svg': contentType = 'image/svg+xml'; break;
          }
          
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
          return;
        }
      }
    }

    // API endpoints require authentication
    if (urlPath.startsWith('/api/')) {
      if (!token) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Authentication required' }));
        return;
      }

      const sessionValidation = auth.validateSession(token);
      if (!sessionValidation.valid) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: sessionValidation.message }));
        return;
      }

      const currentUser = sessionValidation.user;

      // Health endpoint
      if (urlPath === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          server: 'authenticated',
          user: currentUser.username,
          role: currentUser.role
        }));
        return;
      }

      // Stats endpoint
      if (urlPath === '/api/stats') {
        let stats = { ...mockDatabase.stats };
        
        // Filter stats based on user role
        if (currentUser.role === 'affiliate') {
          const affiliateData = auth.getAffiliateData(currentUser.id);
          stats = {
            total: affiliateData.totalLeads,
            sent: affiliateData.convertedLeads,
            queued: affiliateData.totalLeads - affiliateData.convertedLeads,
            conversion_rate: affiliateData.conversionRate,
            total_commissions: affiliateData.totalCommissions,
            pending_commissions: affiliateData.pendingCommissions
          };
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stats));
        return;
      }

      // Leads endpoint
      if (urlPath === '/api/leads') {
        let leads = [...mockDatabase.leads];
        
        // Filter leads based on user role
        if (currentUser.role === 'affiliate') {
          leads = leads.filter(lead => lead.affiliateId === currentUser.id);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ leads }));
        return;
      }

      // Affiliates endpoint (admin only)
      if (urlPath === '/api/affiliates') {
        if (!auth.hasPermission(token, 'affiliates.read')) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Insufficient permissions' }));
          return;
        }

        if (req.method === 'GET') {
          const affiliates = auth.getAllAffiliates().map(aff => ({
            ...aff,
            password: undefined // Remove password from response
          }));
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ affiliates }));
          return;
        }

        if (req.method === 'POST') {
          const data = await parsePostData(req);
          const result = auth.createAffiliate(data);
          
          res.writeHead(result.success ? 201 : 400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
          return;
        }
      }

      // Affiliate status toggle (admin only)
      if (urlPath.match(/^\/api\/affiliates\/(.+)\/toggle$/) && req.method === 'POST') {
        if (!auth.hasPermission(token, 'affiliates.update')) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Insufficient permissions' }));
          return;
        }

        const affiliateId = urlPath.match(/^\/api\/affiliates\/(.+)\/toggle$/)[1];
        const data = await parsePostData(req);
        const result = auth.updateAffiliateStatus(affiliateId, data.isActive);
        
        res.writeHead(result.success ? 200 : 404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
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
            trackerUrl: null,
            description: 'Demo brand for testing and development'
          }
        ]));
        return;
      }

      // User profile endpoint
      if (urlPath === '/api/profile') {
        if (req.method === 'GET') {
          let profile = { ...currentUser };
          
          if (currentUser.role === 'affiliate') {
            const affiliateData = auth.getAffiliateData(currentUser.id);
            profile = { ...profile, ...affiliateData, password: undefined };
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(profile));
          return;
        }
      }
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>404 Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .container { max-width: 400px; margin: 0 auto; }
          h1 { color: #e74c3c; }
          .btn { background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>404 - Not Found</h1>
          <p>The requested resource was not found.</p>
          <a href="/" class="btn">🥭 Go to Dashboard</a>
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
server.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  
  console.log('');
  console.log('🥭 MangoLeads CRM with Authentication');
  console.log('=====================================');
  console.log(`✅ Status: RUNNING`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔐 Login: http://localhost:${PORT}/login`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log('=====================================');
  console.log('👤 Default Admin Login:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('');
  console.log('👥 Sample Affiliate Logins:');
  console.log('   Username: affiliate1 | Password: aff123');
  console.log('   Username: affiliate2 | Password: aff123');
  console.log('=====================================');
  console.log('🎯 Server is ready for use!');
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

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server stopped successfully');
    process.exit(0);
  });
});

console.log('📡 Authentication server setup complete...');
