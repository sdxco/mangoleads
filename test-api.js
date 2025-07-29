#!/usr/bin/env node
/**
 * API Test Script for MangoLeads CRM
 * Tests the submit-lead and leads endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testAPI() {
  console.log('🥭 MangoLeads CRM - API Test');
  console.log('===========================');

  try {
    // Test health endpoint
    console.log('🔧 Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test submit-lead endpoint with valid data
    console.log('');
    console.log('🔧 Testing submit-lead endpoint...');
    const leadData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'securepassword123',
      phonecc: '+1',
      phone: '5551234567',
      country: 'US',
      referer: 'https://example.com',
      aff_sub: 'test_sub',
      aff_sub2: 'test_sub2',
      aff_sub4: 'test_sub4',
      aff_sub5: 'test_sub5',
      orig_offer: 'test_offer'
    };

    const submitResponse = await axios.post(`${BASE_URL}/submit-lead`, leadData);
    console.log('✅ Lead submitted:', submitResponse.data);

    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test leads endpoint
    console.log('');
    console.log('🔧 Testing leads endpoint...');
    const leadsResponse = await axios.get(`${BASE_URL}/leads`);
    console.log('✅ Recent leads:', leadsResponse.data.slice(0, 3));

    console.log('');
    console.log('🎉 All API tests passed!');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Test invalid data
async function testValidation() {
  console.log('');
  console.log('🔧 Testing validation...');
  
  try {
    const invalidData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'invalid-email',
      password: '123', // too short
      phonecc: '+1',
      phone: '555',
      country: 'USA', // should be 2 chars
    };

    await axios.post(`${BASE_URL}/submit-lead`, invalidData);
    console.log('❌ Validation test failed - should have rejected invalid data');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation working - rejected invalid data:', error.response.data);
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

if (require.main === module) {
  setTimeout(async () => {
    try {
      await testAPI();
      await testValidation();
      process.exit(0);
    } catch (err) {
      console.error('❌ Test suite failed:', err.message);
      process.exit(1);
    }
  }, 2000); // Wait 2 seconds for server to start
}

module.exports = { testAPI, testValidation };
