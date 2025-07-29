#!/usr/bin/env node
/**
 * Check if MangoLeads CRM server is running
 */

const axios = require('axios');

async function checkServer() {
  try {
    console.log('🔍 Checking MangoLeads CRM server status...');
    
    // Check health endpoint
    const response = await axios.get('http://localhost:4000/health', { timeout: 5000 });
    
    if (response.status === 200) {
      console.log('✅ Server is running successfully!');
      console.log('🔗 Health check: http://localhost:4000/health');
      console.log('📊 Leads endpoint: http://localhost:4000/leads'); 
      console.log('📝 Submit lead: POST http://localhost:4000/submit-lead');
      console.log('');
      console.log('📋 Test with: npm run test:api');
      console.log('🌐 Or use the api-tests.http file with REST Client extension');
    } else {
      console.log('⚠️  Server responded but with status:', response.status);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running on port 4000');
      console.log('🚀 Start it with: npm run dev');
    } else {
      console.log('❌ Error checking server:', error.message);
    }
  }
}

if (require.main === module) {
  checkServer();
}

module.exports = checkServer;
