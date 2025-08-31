console.log('🚀 Starting MangoLeads CRM...');

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

console.log('📦 Loading modules...');

const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  
  try {
    // Set headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    let urlPath = req.url.split('?')[0]; // Remove query parameters
    
    // Handle API endpoints
    if (urlPath === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        server: 'bulletproof',
        uptime: process.uptime()
      }));
      return;
    }
    
    if (urlPath === '/api/stats') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        total: 2,
        sent: 1,
        queued: 1,
        active_brands: 1
      }));
      return;
    }
    
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
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      }));
      return;
    }
    
    if (urlPath === '/brands') {
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
    
    if (urlPath.startsWith('/brands/') && urlPath.includes('/toggle')) {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Brand toggled successfully',
            active: true
          }));
        });
        return;
      }
    }
    
    // Handle static files
    if (urlPath === '/') {
      urlPath = '/index.html';
    }
    
    const filePath = path.join(__dirname, 'public', urlPath);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const content = fs.readFileSync(filePath);
        
        // Determine content type
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
          <p>The requested file <code>${urlPath}</code> was not found.</p>
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
  console.log('🥭 MangoLeads CRM Bulletproof Server');
  console.log('=====================================');
  console.log(`✅ Status: RUNNING`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log('=====================================');
  console.log('🎯 Server is ready for use!');
  console.log('💡 Press Ctrl+C to stop');
  console.log('');
});

// Error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use!`);
    console.log('💡 Solutions:');
    console.log('   1. Run: taskkill /F /IM node.exe');
    console.log('   2. Wait 5 seconds and try again');
    console.log('   3. Use a different port');
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

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  server.close(() => {
    console.log('✅ Server stopped successfully');
    process.exit(0);
  });
});

// Keep alive
setInterval(() => {
  console.log(`💓 Server heartbeat - ${new Date().toISOString()} - Uptime: ${Math.floor(process.uptime())}s`);
}, 30000); // Every 30 seconds

console.log('📡 Server setup complete, starting listener...');
