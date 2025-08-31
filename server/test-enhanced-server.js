// Enhanced Server Test Script
import { env } from './enhanced-env.js';

const SERVER_URL = `http://localhost:${env.PORT}`;
const API_KEY = env.INTAKE_API_KEY;
const ADMIN_KEY = env.ADMIN_API_KEY;

async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${SERVER_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Enhanced MangoLeads v2 Server');
  console.log('=========================================');
  
  // Test 1: Health check
  console.log('\n📋 Test 1: Health Check');
  const health = await makeRequest('/api/health');
  console.log(`Status: ${health.status}`);
  console.log('Response:', health.data);
  
  // Test 2: API Documentation
  console.log('\n📋 Test 2: API Documentation');
  const docs = await makeRequest('/api/docs');
  console.log(`Status: ${docs.status}`);
  console.log('Available endpoints:', Object.keys(docs.data?.endpoints || {}));
  
  // Test 3: Submit a test lead
  console.log('\n📋 Test 3: Submit Test Lead');
  const testLead = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@test.com',
    phone: '+1234567890',
    country: 'US',
    utm_source: 'test',
    utm_campaign: 'enhanced_test'
  };
  
  const submitResult = await makeRequest('/api/leads/intake', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY
    },
    body: JSON.stringify(testLead)
  });
  
  console.log(`Status: ${submitResult.status}`);
  console.log('Response:', submitResult.data);
  
  if (submitResult.data?.id) {
    const leadId = submitResult.data.id;
    
    // Test 4: Get the submitted lead
    console.log('\n📋 Test 4: Retrieve Submitted Lead');
    const getResult = await makeRequest(`/api/leads/${leadId}`, {
      headers: {
        'x-admin-key': ADMIN_KEY
      }
    });
    
    console.log(`Status: ${getResult.status}`);
    console.log('Lead data:', getResult.data?.data);
    
    // Test 5: Get lead logs
    console.log('\n📋 Test 5: Get Lead Logs');
    const logsResult = await makeRequest(`/api/leads/${leadId}/logs`, {
      headers: {
        'x-admin-key': ADMIN_KEY
      }
    });
    
    console.log(`Status: ${logsResult.status}`);
    console.log('Logs count:', logsResult.data?.count || 0);
    
    // Test 6: Manual dispatch
    console.log('\n📋 Test 6: Manual Dispatch');
    const dispatchResult = await makeRequest(`/api/leads/${leadId}/dispatch`, {
      method: 'POST',
      headers: {
        'x-admin-key': ADMIN_KEY
      }
    });
    
    console.log(`Status: ${dispatchResult.status}`);
    console.log('Dispatch result:', dispatchResult.data?.data);
  }
  
  // Test 7: List all leads
  console.log('\n📋 Test 7: List All Leads');
  const listResult = await makeRequest('/api/leads?limit=5', {
    headers: {
      'x-admin-key': ADMIN_KEY
    }
  });
  
  console.log(`Status: ${listResult.status}`);
  console.log('Leads count:', listResult.data?.data?.length || 0);
  
  // Test 8: Test rate limiting (multiple requests)
  console.log('\n📋 Test 8: Rate Limiting');
  const rateLimitPromises = Array.from({ length: 5 }, () => 
    makeRequest('/api/health')
  );
  
  const rateLimitResults = await Promise.all(rateLimitPromises);
  const successCount = rateLimitResults.filter(r => r.status === 200).length;
  console.log(`Successful requests: ${successCount}/5`);
  
  console.log('\n✅ Enhanced server testing complete!');
  console.log('\n🎯 Next steps:');
  console.log('1. Test the CRM interface at http://localhost:' + env.PORT);
  console.log('2. Submit leads via the web form');
  console.log('3. Monitor lead dispatch logs');
  console.log('4. Test API integrations');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${SERVER_URL}/api/health`);
    if (response.ok) {
      await runTests();
    } else {
      console.log('❌ Server not responding properly');
    }
  } catch (error) {
    console.log('❌ Server not running. Please start with:');
    console.log('   node enhanced-server.js');
  }
}

checkServer();
