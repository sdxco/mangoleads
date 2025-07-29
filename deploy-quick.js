#!/usr/bin/env node
/**
 * Quick Deploy Script for MangoLeads CRM
 * Vercel + PlanetScale deployment
 */

const { exec } = require('child_process');
const fs = require('fs');

console.log('🚀 MangoLeads CRM - Quick Deploy to Vercel');
console.log('==========================================');
console.log('');

async function checkPrerequisites() {
  console.log('📋 Checking prerequisites...');
  
  // Check if we have package.json
  if (!fs.existsSync('package.json')) {
    console.log('❌ No package.json found. Run this from your project root.');
    process.exit(1);
  }
  
  console.log('✅ Project structure looks good');
  console.log('');
}

function showInstructions() {
  console.log('📝 STEP-BY-STEP DEPLOYMENT:');
  console.log('');
  
  console.log('1️⃣ DATABASE SETUP (PlanetScale):');
  console.log('   • Go to: https://planetscale.com');
  console.log('   • Sign up with GitHub');
  console.log('   • Create database: "mangoleads"');
  console.log('   • Copy connection string');
  console.log('');
  
  console.log('2️⃣ VERCEL DEPLOYMENT:');
  console.log('   • Go to: https://vercel.com');
  console.log('   • Sign up with GitHub');
  console.log('   • Import repository: mangoleads');
  console.log('   • Set environment variables:');
  console.log('     - DATABASE_URL=<your-planetscale-url>');
  console.log('     - JWT_SECRET=<random-32-char-string>');
  console.log('     - NODE_ENV=production');
  console.log('');
  
  console.log('3️⃣ DOMAIN CONNECTION:');
  console.log('   • In Vercel dashboard → Settings → Domains');
  console.log('   • Add your domain: yoursite.com');
  console.log('   • Update DNS at your registrar:');
  console.log('     - CNAME: www → cname.vercel-dns.com');
  console.log('     - A: @ → 76.76.19.19');
  console.log('');
  
  console.log('4️⃣ DATABASE INITIALIZATION:');
  console.log('   • After deployment, run this command in Vercel terminal:');
  console.log('     npm run db:setup');
  console.log('');
}

function generateJWTSecret() {
  console.log('🔑 GENERATING JWT SECRET:');
  console.log('');
  
  const crypto = require('crypto');
  const secret = crypto.randomBytes(32).toString('hex');
  
  console.log('   Copy this JWT_SECRET for Vercel:');
  console.log(`   ${secret}`);
  console.log('');
}

function showVercelConfig() {
  console.log('⚙️ VERCEL CONFIGURATION:');
  console.log('');
  
  const vercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "server.js",
        "use": "@vercel/node"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/server.js"
      }
    ],
    "env": {
      "NODE_ENV": "production"
    }
  };
  
  console.log('   Save this as vercel.json in your project root:');
  console.log('   ' + JSON.stringify(vercelConfig, null, 2));
  console.log('');
}

function createVercelConfig() {
  const vercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "server.js",
        "use": "@vercel/node"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/server.js"
      }
    ],
    "env": {
      "NODE_ENV": "production"
    }
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Created vercel.json configuration file');
  console.log('');
}

function showNextSteps() {
  console.log('🎯 NEXT STEPS:');
  console.log('');
  console.log('1. Create PlanetScale database');
  console.log('2. Deploy to Vercel with environment variables');
  console.log('3. Connect your domain');
  console.log('4. Initialize database schema');
  console.log('5. Test your API endpoints');
  console.log('');
  console.log('🔗 USEFUL LINKS:');
  console.log('   • PlanetScale: https://planetscale.com');
  console.log('   • Vercel: https://vercel.com');
  console.log('   • Domain DNS Help: https://vercel.com/docs/concepts/projects/domains');
  console.log('');
  console.log('💡 After deployment, test with:');
  console.log('   curl -X POST https://yoursite.com/submit-lead \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"name":"Test","email":"test@example.com","phone":"555-0123"}\'');
}

async function main() {
  try {
    await checkPrerequisites();
    showInstructions();
    generateJWTSecret();
    showVercelConfig();
    createVercelConfig();
    showNextSteps();
    
    console.log('🎉 Ready for deployment! Follow the steps above.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;
