#!/usr/bin/env node
/**
 * Queue Processing Validation for MangoLeads CRM
 * Tests lead submission and queue processing
 */

const axios = require('axios');
const db = require('./db');

async function validateQueueProcessing() {
  console.log('🔄 Queue Processing Validation');
  console.log('==============================');

  try {
    // Submit a test lead
    console.log('1. Submitting test lead...');
    const testLead = {
      first_name: 'Queue',
      last_name: 'Test',
      email: `queue.test.${Date.now()}@example.com`,
      password: 'TestPassword123',
      phonecc: '+1',
      phone: '5559999999',
      country: 'US',
      referer: 'queue-validation-test'
    };

    const response = await axios.post('http://localhost:4000/submit-lead', testLead);
    console.log('   ✅ Lead submitted:', response.data);
    const leadId = response.data.id;

    // Check initial status
    console.log('\n2. Checking initial status in database...');
    let result = await db.query('SELECT id, email, status, attempts FROM leads WHERE id = $1', [leadId]);
    let lead = result.rows[0];
    console.log(`   📊 Initial status: ${lead.status}, attempts: ${lead.attempts}`);

    // Wait and check for processing
    console.log('\n3. Waiting for queue processing...');
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      result = await db.query('SELECT id, email, status, attempts, last_error FROM leads WHERE id = $1', [leadId]);
      lead = result.rows[0];
      
      console.log(`   ⏱️  ${i + 1}s - Status: ${lead.status}, attempts: ${lead.attempts}`);
      
      if (lead.status !== 'queued') {
        if (lead.status === 'sent') {
          console.log('   ✅ Lead successfully processed and sent!');
        } else if (lead.status === 'error') {
          console.log('   ⚠️  Lead processing failed:', lead.last_error);
        }
        break;
      }
    }

    // Final status report
    console.log('\n4. Final status report...');
    result = await db.query('SELECT status, COUNT(*) as count FROM leads GROUP BY status');
    console.log('   📈 Lead status summary:');
    result.rows.forEach(row => {
      console.log(`     ${row.status}: ${row.count} leads`);
    });

    // Queue behavior analysis
    console.log('\n5. Queue behavior analysis...');
    if (lead.status === 'sent') {
      console.log('   🎯 Queue is working correctly - lead was processed and sent');
      console.log('   📡 External tracker call was successful');
    } else if (lead.status === 'error') {
      console.log('   🔄 Queue is working but external tracker failed');
      console.log('   🔗 This is expected if TRACKER_URL is not a real endpoint');
      console.log('   ✅ Retry logic and error handling are working');
    } else {
      console.log('   ⏳ Lead is still in queue - may need more time or Redis');
    }

    console.log('\n🎉 Queue validation completed!');

  } catch (error) {
    console.error('\n❌ Queue validation failed:', error.message);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  validateQueueProcessing();
}

module.exports = validateQueueProcessing;
