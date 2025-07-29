#!/usr/bin/env node

/**
 * Test External Brand Integration
 * Tests the Dekikoy Trading Platform integration
 */

const axios = require('axios');

const CRM_BASE_URL = 'http://localhost:4000';

// Test data for mock brand integration
const testLead = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe.test@example.com',
  phonecc: '+1',
  phone: '1234567890',
  country: 'US',
  brand_id: 'mock-trading-test', // This will test internal CRM storage only
  aff_id: '28215',
  offer_id: '1000',
  user_ip: '192.168.1.100',
  aff_sub: 'test-campaign'
};

async function testMockIntegration() {
  console.log('🚀 Testing Mock Brand Integration...\n');
  
  try {
    console.log('📤 Submitting test lead to CRM...');
    console.log('Lead Data:', JSON.stringify(testLead, null, 2));
    
    const response = await axios.post(`${CRM_BASE_URL}/api/leads`, testLead, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('\n✅ CRM Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.status === 'queued') {
      console.log('\n🎉 SUCCESS: Lead successfully stored in CRM!');
      console.log('Lead Status:', response.data.status);
      console.log('Brand:', response.data.brand);
      console.log('Lead ID:', response.data.id);
    } else if (response.data.external_api) {
      console.log('\n⚠️  Warning: This appears to be an external brand, not mock testing');
    } else {
      console.log('\n✅ Lead processed with status:', response.data.status);
    }
    
    // Test fetching the lead from CRM
    console.log('\n📥 Fetching lead from CRM dashboard...');
    const leadsResponse = await axios.get(`${CRM_BASE_URL}/api/leads`);
    const submittedLead = leadsResponse.data.leads.find(lead => 
      lead.email === testLead.email && lead.brand_id === testLead.brand_id
    );
    
    if (submittedLead) {
      console.log('✅ Lead found in CRM:');
      console.log(`ID: ${submittedLead.id}`);
      console.log(`Status: ${submittedLead.status}`);
      console.log(`Brand: ${submittedLead.brand_name}`);
      console.log(`Created: ${submittedLead.created_at}`);
    } else {
      console.log('❌ Lead not found in CRM database');
    }
    
  } catch (error) {
    console.error('\n💥 TEST FAILED:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testBrandConfiguration() {
  console.log('\n🔧 Testing Brand Configuration...\n');
  
  try {
    // Test mock brand
    console.log('Testing mock brand (mock-trading-test)...');
    const mockResponse = await axios.post(`${CRM_BASE_URL}/api/leads`, {
      ...testLead,
      email: 'mock.test@example.com',
      brand_id: 'mock-trading-test'
    });
    
    console.log('Mock Brand Response:', mockResponse.data.status);
    
    // Test demo brand
    console.log('\nTesting demo brand (trading-platform-demo)...');
    const internalResponse = await axios.post(`${CRM_BASE_URL}/api/leads`, {
      ...testLead,
      email: 'internal.test@example.com',
      brand_id: 'trading-platform-demo'
    });
    
    console.log('Demo Brand Response:', internalResponse.data.status);
    
    // Test invalid brand
    console.log('\nTesting invalid brand...');
    try {
      await axios.post(`${CRM_BASE_URL}/api/leads`, {
        ...testLead,
        email: 'invalid.test@example.com',
        brand_id: 'non-existent-brand'
      });
    } catch (invalidError) {
      console.log('✅ Invalid brand correctly rejected:', invalidError.response.data.error);
    }
    
  } catch (error) {
    console.error('Brand configuration test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  console.log('🧪 MangoLeads Mock Brand Test Suite\n');
  console.log('=================================\n');
  
  // Check if CRM server is running
  try {
    await axios.get(`${CRM_BASE_URL}/status`);
    console.log('✅ CRM Server is running\n');
  } catch (error) {
    console.error('❌ CRM Server is not running. Please start it first with: npm start');
    process.exit(1);
  }
  
  await testBrandConfiguration();
  await testMockIntegration();
  
  console.log('\n🏁 Test Suite Complete!');
  console.log('\nNext Steps:');
  console.log('1. Check the CRM dashboard at http://localhost:4000');
  console.log('2. Verify leads appear in the leads table with "Mock Trading Test" brand');
  console.log('3. Test the landing page at autotradeiq-reg.store');
  console.log('4. Once mock testing is complete, configure real external brands');
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testMockIntegration, testBrandConfiguration };
