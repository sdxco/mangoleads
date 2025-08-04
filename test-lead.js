#!/usr/bin/env node
/**
 * MangoLeads Test Lead Submitter
 * Quick script to test lead submission with proper error handling
 */

const https = require('https');

const BASE_URL = 'https://mangoleads-production.up.railway.app';

// Test lead data
const testLead = {
  brand_id: "2000", // Trading Platform Demo
  first_name: "John",
  last_name: "TestUser", 
  email: `test-${Date.now()}@example.com`, // Unique email
  phonecc: "+1",
  phone: "5551234567",
  country: "US"
};

console.log('🧪 MangoLeads CRM - Test Lead Submission');
console.log('=========================================');
console.log('\n📝 Submitting test lead:', JSON.stringify(testLead, null, 2));

// Function to make HTTP POST request
function submitLead(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'mangoleads-production.up.railway.app',
      port: 443,
      path: '/api/leads',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          resolve({ statusCode: res.statusCode, data: result });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Function to check leads
function getLeads() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'mangoleads-production.up.railway.app',
      port: 443,
      path: '/api/leads',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          resolve({ statusCode: res.statusCode, data: result });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Main test function
async function runTest() {
  try {
    // Step 1: Submit the lead
    console.log('\n🚀 Step 1: Submitting lead...');
    const submitResult = await submitLead(testLead);
    
    console.log(`📊 Response Status: ${submitResult.statusCode}`);
    console.log('📄 Response Data:', submitResult.data);
    
    if (submitResult.statusCode === 201) {
      console.log('\n✅ SUCCESS! Lead submitted successfully!');
      console.log(`🆔 Lead ID: ${submitResult.data.id}`);
      console.log(`📊 Status: ${submitResult.data.status}`);
      console.log(`🏢 Brand: ${submitResult.data.brand}`);
      
      // Step 2: Wait a moment then check if lead appears
      console.log('\n⏳ Step 2: Waiting 3 seconds then checking leads...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const leadsResult = await getLeads();
      if (leadsResult.statusCode === 200 && leadsResult.data.leads) {
        const ourLead = leadsResult.data.leads.find(lead => 
          lead.email === testLead.email
        );
        
        if (ourLead) {
          console.log('\n🎯 Found our test lead in CRM:');
          console.log(`   ID: ${ourLead.id}`);
          console.log(`   Name: ${ourLead.first_name} ${ourLead.last_name}`);
          console.log(`   Email: ${ourLead.email}`);
          console.log(`   Status: ${ourLead.status}`);
          console.log(`   Created: ${ourLead.created_at}`);
        } else {
          console.log('\n⚠️  Lead submitted but not found in leads list');
        }
      }
      
    } else if (submitResult.statusCode === 400) {
      console.log('\n❌ VALIDATION ERROR:');
      console.log('   The lead data has validation issues.');
      if (submitResult.data.missing_fields) {
        console.log('   Missing fields:', submitResult.data.missing_fields.join(', '));
      }
      
    } else {
      console.log('\n❌ SUBMISSION FAILED:');
      console.log(`   Status: ${submitResult.statusCode}`);
      console.log(`   Error: ${JSON.stringify(submitResult.data)}`);
    }
    
  } catch (error) {
    console.error('\n💥 TEST FAILED:', error.message);
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Visit the dashboard: https://mangoleads-production.up.railway.app');
  console.log('2. Check the "Recent Leads" tab to see your lead');
  console.log('3. Use the "API Integration" tab to test more leads');
  console.log('4. View "Analytics" to see lead distribution');
}

// Run the test
runTest();
