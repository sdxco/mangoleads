const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

// Basic API endpoints
app.get('/api/stats', (req, res) => {
  res.json({
    total: 2,
    sent: 1,
    queued: 1,
    active_brands: 1
  });
});

app.get('/api/leads', (req, res) => {
  const mockLeads = [
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
  ];
  
  res.json({ leads: mockLeads });
});

app.get('/brands', (req, res) => {
  res.json([
    {
      id: 'demo',
      name: 'Demo Trading Platform',
      active: true,
      type: 'demo',
      trackerUrl: null,
      description: 'Demo brand for testing and development'
    }
  ]);
});

app.post('/brands/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  
  res.json({ 
    success: true, 
    message: `Brand ${active ? 'activated' : 'deactivated'} successfully`,
    brand_id: id,
    active: active
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server with error handling
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log(`🥭 MangoLeads CRM Professional running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Don't exit immediately, let the process continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately, let the process continue
});

module.exports = app;
