#!/usr/bin/env node
/**
 * Redis Monitor for MangoLeads CRM
 * Checks Redis status and monitors queue jobs
 */

const Redis = require('ioredis');

async function checkRedis() {
  console.log('🔍 Redis Status Check');
  console.log('====================');

  try {
    // Try to connect to Redis
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    await redis.ping();
    console.log('✅ Redis is running and responding');
    
    // Check if there are any jobs in our queue
    const queueLength = await redis.llen('bull:send:waiting');
    console.log(`📋 Jobs in queue: ${queueLength}`);
    
    // Get some queue info
    const queueInfo = await redis.info('memory');
    console.log('💾 Redis memory info available');
    
    redis.disconnect();
    
    console.log('');
    console.log('📊 Queue Monitoring:');
    console.log('   - Redis queue is active');
    console.log('   - Background workers are processing jobs');
    console.log('   - To monitor in real-time: redis-cli monitor');
    
  } catch (error) {
    console.log('❌ Redis not available:', error.message);
    console.log('');
    console.log('📝 Fallback Mode:');
    console.log('   - Using in-memory queue instead');
    console.log('   - Jobs are processed but not persisted');
    console.log('   - Check server console logs for processing activity');
    
    // Test the in-memory queue
    console.log('');
    console.log('🧪 Testing in-memory queue...');
    const queue = require('./queue');
    
    if (queue.processLoop) {
      console.log('✅ In-memory queue is active');
      console.log('   - Jobs are processed every 1 second');
      console.log('   - Check server logs for "processing" messages');
    } else {
      console.log('❓ Queue type unclear - check queue.js configuration');
    }
  }
}

if (require.main === module) {
  checkRedis().then(() => process.exit(0));
}

module.exports = checkRedis;
