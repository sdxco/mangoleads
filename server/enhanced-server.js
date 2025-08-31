// Enhanced MangoLeads v2 Server
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

// Import enhanced modules
import { env } from './enhanced-env.js';
import router from './enhanced-routes.js';
import { processQueuedLeads } from './enhanced-dispatcher.js';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (env.ALLOWED_ORIGINS.length === 0 || env.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-admin-key']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`${timestamp} ${method} ${url} - ${ip}`);
  next();
});

// Serve static files (CRM interface)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', router);

// Root route - serve CRM interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404s
app.use('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      error: 'API endpoint not found',
      message: `${req.method} ${req.path} is not a valid API endpoint`,
      availableEndpoints: '/api/docs'
    });
  } else {
    // Serve CRM interface for SPA routing
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error.message);
  
  if (error.message.includes('CORS')) {
    res.status(403).json({
      error: 'CORS error',
      message: 'Origin not allowed'
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
      message: env.IS_DEVELOPMENT ? error.message : 'Something went wrong'
    });
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection:', reason);
  if (env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Cron job for processing queued leads (every 2 minutes)
if (env.NODE_ENV === 'production') {
  cron.schedule('*/2 * * * *', async () => {
    try {
      console.log('🔄 Running scheduled lead processing...');
      await processQueuedLeads();
    } catch (error) {
      console.error('💥 Scheduled processing failed:', error.message);
    }
  });
  console.log('⏰ Scheduled lead processing enabled (every 2 minutes)');
}

// Start server
const server = app.listen(env.PORT, () => {
  console.log('🚀 MangoLeads v2 Enhanced Server');
  console.log('================================');
  console.log(`🌐 Server running on http://localhost:${env.PORT}`);
  console.log(`📋 CRM Interface: http://localhost:${env.PORT}`);
  console.log(`🔗 API Documentation: http://localhost:${env.PORT}/api/docs`);
  console.log('');
  console.log('📋 API Endpoints:');
  console.log('   GET  /api/health - Health check');
  console.log('   POST /api/leads/intake - Submit leads (x-api-key required)');
  console.log('   GET  /api/leads - List all leads (x-admin-key required)');
  console.log('   GET  /api/leads/:id/logs - Get lead logs (x-admin-key required)');
  console.log('   POST /api/leads/:id/dispatch - Re-dispatch lead (x-admin-key required)');
  console.log('   DELETE /api/leads/:id - Delete lead (x-admin-key required)');
  console.log('');
  console.log('🔑 Authentication:');
  console.log(`   Intake API Key: ${env.INTAKE_API_KEY}`);
  console.log(`   Admin API Key: ${env.ADMIN_API_KEY}`);
  console.log('');
  console.log('⚙️ Configuration:');
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Database: ${env.DB_DRIVER}`);
  console.log(`   Rate Limit: ${env.RATE_LIMIT_MAX_REQUESTS} requests per ${env.RATE_LIMIT_WINDOW_MS / 1000}s`);
  console.log(`   CORS Origins: ${env.ALLOWED_ORIGINS.join(', ')}`);
  console.log('');
  console.log('🎉 Ready for lead processing!');
});

// Increase timeout for slow operations
server.timeout = 30000;

export default app;
