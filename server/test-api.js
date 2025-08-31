#!/usr/bin/env node

/**
 * Test script for MangoLeads v2 API
 * Run with: node test-api.js
 */

const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:8080/api';
const API_KEY = 'supersecret_ingest_key';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing MangoLeads v2 API...\n');
  
  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const result = await makeRequest(`${API_BASE}/health`);
    console.log(`   ✅ Status: ${result.status}, Response:`, result.data);
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
    return;
  }
  
  // Test 2: Lead intake
  console.log('\n2. Testing lead intake...');
  const testLead = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    country: 'US',
    phone: '1234567890',
    phonecc: '+1'
  };
  
  try {
    const result = await makeRequest(`${API_BASE}/leads/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(testLead)
    });
    
    if (result.status === 201) {
      console.log(`   ✅ Lead created! ID: ${result.data.id}`);
      
      // Test 3: Get logs for the lead
      console.log('\n3. Testing lead logs...');
      const logsResult = await makeRequest(`${API_BASE}/leads/${result.data.id}/logs`);
      console.log(`   ✅ Logs retrieved:`, logsResult.data);
      
      // Test 4: Re-dispatch lead
      console.log('\n4. Testing lead re-dispatch...');
      const dispatchResult = await makeRequest(`${API_BASE}/leads/${result.data.id}/dispatch`, {
        method: 'POST'
      });
      console.log(`   ✅ Dispatch result:`, dispatchResult.data);
      
    } else {
      console.log(`   ❌ Lead creation failed:`, result);
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
  }
  
  console.log('\n🎉 API test completed!');
}

testAPI();
