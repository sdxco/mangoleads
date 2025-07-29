#!/usr/bin/env node

/**
 * Database Setup Script for MangoLeads CRM
 * This script helps set up the database and run migrations
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration for setup (connects to default postgres db first)
const setupConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: 'postgres', // Connect to default postgres db to create our db
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

async function createDatabase() {
  const pool = new Pool(setupConfig);
  
  try {
    console.log('🔧 Creating database...');
    
    // Check if database exists
    const checkDb = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'leads'"
    );
    
    if (checkDb.rows.length === 0) {
      await pool.query('CREATE DATABASE leads');
      console.log('✅ Database "leads" created successfully');
    } else {
      console.log('ℹ️  Database "leads" already exists');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    process.exit(1);
  }
}

async function runSchema() {
  // Now connect to the leads database
  const leadsConfig = {
    ...setupConfig,
    database: 'leads'
  };
  
  const pool = new Pool(leadsConfig);
  
  try {
    console.log('🔧 Running schema...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schemaSql);
    console.log('✅ Schema applied successfully');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error running schema:', error.message);
    process.exit(1);
  }
}

async function testConnection() {
  const { testConnection } = require('./db');
  console.log('🔧 Testing database connection...');
  const success = await testConnection();
  
  if (success) {
    console.log('✅ Database setup completed successfully!');
  } else {
    console.error('❌ Database connection test failed');
    process.exit(1);
  }
}

async function main() {
  console.log('🥭 MangoLeads CRM - Database Setup');
  console.log('================================');
  
  await createDatabase();
  await runSchema();
  await testConnection();
  
  console.log('');
  console.log('🎉 Setup complete! You can now start the server with:');
  console.log('   npm run dev');
}

// Run setup if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { createDatabase, runSchema, testConnection };
