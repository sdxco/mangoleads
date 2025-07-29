#!/usr/bin/env node
/**
 * Quick diagnostic script for MangoLeads CRM
 */

console.log('🔍 MangoLeads CRM Diagnostic');
console.log('===========================');

// Check environment
console.log('1. Checking environment variables...');
require('dotenv').config();
console.log('   PORT:', process.env.PORT);
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');
console.log('   REDIS_URL:', process.env.REDIS_URL ? 'Set' : 'Missing');

// Check dependencies
console.log('2. Checking dependencies...');
try {
  require('express');
  console.log('   ✅ Express loaded');
} catch (e) {
  console.log('   ❌ Express failed:', e.message);
}

try {
  require('pg');
  console.log('   ✅ PostgreSQL driver loaded');
} catch (e) {
  console.log('   ❌ PostgreSQL driver failed:', e.message);
}

// Check database connection
console.log('3. Testing database connection...');
try {
  const pool = require('./db');
  pool.query('SELECT 1')
    .then(() => console.log('   ✅ Database connection successful'))
    .catch(err => console.log('   ❌ Database connection failed:', err.message));
} catch (e) {
  console.log('   ❌ Database module failed:', e.message);
}

// Check queue
console.log('4. Testing queue system...');
try {
  const queue = require('./queue');
  console.log('   ✅ Queue system loaded');
} catch (e) {
  console.log('   ❌ Queue system failed:', e.message);
}

setTimeout(() => {
  console.log('🎯 Diagnostic complete');
  process.exit(0);
}, 2000);
