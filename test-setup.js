#!/usr/bin/env node
/**
 * Test script for MangoLeads CRM setup
 */

require('dotenv').config();

async function testSetup() {
  console.log('🥭 MangoLeads CRM - Setup Test');
  console.log('============================');
  
  // Test environment variables
  console.log('📋 Environment Configuration:');
  console.log(`   PORT: ${process.env.PORT}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL}`);
  console.log(`   REDIS_URL: ${process.env.REDIS_URL}`);
  console.log(`   AFF_ID: ${process.env.AFF_ID}`);
  console.log(`   OFFER_ID: ${process.env.OFFER_ID}`);
  console.log('');

  // Test database connection
  console.log('🔧 Testing database connection...');
  try {
    const db = require('./db');
    const result = await db.query('SELECT NOW(), COUNT(*) FROM leads');
    console.log('✅ Database connected successfully');
    console.log(`📊 Current time: ${result.rows[0].now}`);
    console.log(`📈 Total leads: ${result.rows[0].count}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }

  // Test queue system
  console.log('');
  console.log('🔧 Testing queue system...');
  try {
    const queue = require('./queue');
    console.log('✅ Queue system initialized');
    
    // Test adding a job to queue
    const testJob = { id: 'test', message: 'Hello Queue!' };
    await queue.add('test-job', testJob);
    console.log('📤 Test job added to queue');
  } catch (err) {
    console.error('❌ Queue setup failed:', err.message);
  }

  // Test helpers
  console.log('');
  console.log('🔧 Testing helper functions...');
  try {
    const helpers = require('./helpers');
    const config = helpers.getConfig();
    console.log('✅ Helpers loaded successfully');
    console.log(`🔧 Salt rounds: ${config.saltRounds}`);
    console.log(`🌐 Landing domain: ${config.landingDomain}`);
  } catch (err) {
    console.error('❌ Helpers test failed:', err.message);
  }

  console.log('');
  console.log('🎉 Setup test completed!');
  process.exit(0);
}

if (require.main === module) {
  testSetup().catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  });
}

module.exports = testSetup;
