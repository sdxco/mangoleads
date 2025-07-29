#!/usr/bin/env node

/**
 * Test External Brand Integration
 * Tests the Dekikoy Trading Platform integration
 */

const axios = require('axios');

const CRM_BASE_URL = 'http://localhost:4000';

// Test data for Dekikoy integration
const testLead = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe.test@example.com',
  phonecc: '+1',
  phone: '1234567890',
  country: 'US',
  brand_id: 'dekikoy-trading', // This will trigger external API integration
  aff_id: '28215',
  offer_id: '1737',
  user_ip: '192.168.1.100',
  aff_sub: 'test-campaign'
};

async function testExternalIntegration() {
  console.log('🚀 Testing External Brand Integration...\n');
  
  try {
    console.log('📤 Submitting test lead to CRM...');
    console.log('Lead Data:', JSON.stringify(testLead, null, 2));
    
    const response = await axios.post(`${CRM_BASE_URL}/api/leads`, testLead, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 second timeout for external API calls
    });
    
    console.log('\n✅ CRM Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.external_api) {
      if (response.data.external_api.success) {
        console.log('\n🎉 SUCCESS: Lead successfully sent to Dekikoy API!');
        console.log('Lead Status:', response.data.status);
        console.log('External API Status:', response.data.external_api.status);
      } else {
        console.log('\n❌ EXTERNAL API FAILED:');
        console.log('Error:', response.data.external_api.error);
        console.log('Status:', response.data.external_api.status);
      }
    } else {
      console.log('\n⚠️  Warning: This appears to be an internal brand, not external API integration');
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
    // Test internal brand
    console.log('Testing internal brand (trading-platform-demo)...');
    const internalResponse = await axios.post(`${CRM_BASE_URL}/api/leads`, {
      ...testLead,
      email: 'internal.test@example.com',
      brand_id: 'trading-platform-demo'
    });
    
    console.log('Internal Brand Response:', internalResponse.data.status);
    
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
  console.log('🧪 MangoLeads External Integration Test Suite\n');
  console.log('==========================================\n');
  
  // Check if CRM server is running
  try {
    await axios.get(`${CRM_BASE_URL}/status`);
    console.log('✅ CRM Server is running\n');
  } catch (error) {
    console.error('❌ CRM Server is not running. Please start it first with: npm start');
    process.exit(1);
  }
  
  await testBrandConfiguration();
  await testExternalIntegration();
  
  console.log('\n🏁 Test Suite Complete!');
  console.log('\nNext Steps:');
  console.log('1. Check the CRM dashboard at http://localhost:4000');
  console.log('2. Verify leads appear in the leads table');
  console.log('3. Test the landing page at autotradeiq-reg.store');
  console.log('4. Monitor external API responses for real integrations');
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testExternalIntegration, testBrandConfiguration };
