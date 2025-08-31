// Enhanced Environment Configuration
import 'dotenv/config';

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export const env = {
  PORT: Number(process.env.PORT || 3000),
  
  // Database configuration
  DB_DRIVER: (process.env.DB_DRIVER || 'memory').toLowerCase(), // memory|postgres|supabase
  DATABASE_URL: process.env.DATABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  
  // API Security
  INTAKE_API_KEY: process.env.INTAKE_API_KEY || 'test_api_key_123',
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || 'admin_key_456',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_in_production',
  
  // CORS and Security
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',').map(s => s.trim()).filter(Boolean),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  
  // Lead processing
  MAX_RETRY_ATTEMPTS: Number(process.env.MAX_RETRY_ATTEMPTS || 3),
  RETRY_DELAY_MS: Number(process.env.RETRY_DELAY_MS || 2000),
  DUPLICATE_WINDOW_HOURS: Number(process.env.DUPLICATE_WINDOW_HOURS || 24),
  
  // Monitoring
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
  
  // Development
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production'
};
