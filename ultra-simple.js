const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  let filePath = req.url;
  
  // API endpoints
  if (filePath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      server: 'ultra-simple'
    }));
    return;
  }
  
  if (filePath === '/api/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      total: 2,
      sent: 1,
      queued: 1,
      active_brands: 1
    }));
    return;
  }
  
  if (filePath === '/api/leads') {
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
  
  if (filePath === '/brands') {
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
  
  if (filePath.startsWith('/brands/') && filePath.includes('/toggle')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: 'Brand toggled successfully',
      active: true
    }));
    return;
  }
  
  // Serve static files
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  const fullPath = path.join(__dirname, 'public', filePath);
  
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>404 Not Found</title></head>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The requested file ${filePath} was not found.</p>
            <p><a href="/">Go to Dashboard</a></p>
          </body>
          </html>
        `);
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log('🥭 MangoLeads CRM Ultra-Simple Server');
  console.log(`✅ Running at: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log('🎯 Ready for use!');
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.log('💡 Try running: taskkill /F /IM node.exe');
  } else {
    console.error('❌ Server error:', err);
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

console.log('🚀 Starting MangoLeads CRM...');
