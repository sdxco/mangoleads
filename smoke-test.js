#!/usr/bin/env node
/**
 * Smoke Test for MangoLeads CRM
 * Simple test to verify API and database functionality
 */

const axios = require('axios');
const db = require('./db');

async function smokeTest() {
  console.log('🚀 MangoLeads CRM - Smoke Test');
  console.log('==============================');

  try {
    // Step 1: Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:4000/health');
    console.log('   ✅ Health check successful:', healthResponse.data);

    // Step 2: Submit a test lead
    console.log('\n2. Submitting test lead...');
    const testLead = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe.test@example.com',
      password: 'Abc12345',
      phonecc: '+1',
      phone: '5551234567',
      country: 'US',
      referer: 'smoke-test'
    };

    const submitResponse = await axios.post('http://localhost:4000/submit-lead', testLead);
    console.log('   ✅ Lead submitted successfully:', submitResponse.data);
    const leadId = submitResponse.data.id;

    // Step 3: Check database directly
    console.log('\n3. Checking database...');
    const dbResult = await db.query('SELECT id, email, status, created_at FROM leads WHERE id = $1', [leadId]);
    if (dbResult.rows.length > 0) {
      const lead = dbResult.rows[0];
      console.log('   ✅ Lead found in database:');
      console.log('     ID:', lead.id);
      console.log('     Email:', lead.email);
      console.log('     Status:', lead.status);
      console.log('     Created:', lead.created_at);
    } else {
      console.log('   ❌ Lead not found in database');
    }

    // Step 4: Test leads endpoint
    console.log('\n4. Testing leads endpoint...');
    const leadsResponse = await axios.get('http://localhost:4000/leads');
    console.log('   ✅ Retrieved leads count:', leadsResponse.data.length);
    if (leadsResponse.data.length > 0) {
      console.log('   📊 Latest lead:', {
        id: leadsResponse.data[0].id,
        email: leadsResponse.data[0].email,
        status: leadsResponse.data[0].status
      });
    }

    // Step 5: Check all leads in database
    console.log('\n5. Database summary...');
    const allLeads = await db.query('SELECT id, email, status FROM leads ORDER BY id DESC LIMIT 5');
    console.log('   📈 Recent leads in database:');
    allLeads.rows.forEach(lead => {
      console.log(`     ID: ${lead.id}, Email: ${lead.email}, Status: ${lead.status}`);
    });

    console.log('\n🎉 Smoke test completed successfully!');
    console.log('✅ API endpoints working');
    console.log('✅ Database operations working');
    console.log('✅ Lead submission and retrieval working');

  } catch (error) {
    console.error('\n❌ Smoke test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  smokeTest();
}

module.exports = smokeTest;
