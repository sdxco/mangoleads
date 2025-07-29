#!/usr/bin/env node
/**
 * Local + Tunnel Deploy Script for MangoLeads CRM
 * Quick setup for testing and demos
 */

console.log('🏠 MangoLeads CRM - Local + Tunnel Setup');
console.log('=======================================');
console.log('');

function showNgrokSetup() {
  console.log('📦 NGROK SETUP:');
  console.log('');
  console.log('   Option 1 - Install via npm:');
  console.log('   npm install -g ngrok');
  console.log('');
  console.log('   Option 2 - Download from ngrok.com:');
  console.log('   • Go to https://ngrok.com');
  console.log('   • Sign up for free account');
  console.log('   • Download ngrok for macOS');
  console.log('   • Move to /usr/local/bin/ngrok');
  console.log('');
}

function showLocalSetup() {
  console.log('🚀 LOCAL SERVER SETUP:');
  console.log('');
  console.log('   1. Start your development server:');
  console.log('      npm run dev');
  console.log('');
  console.log('   2. Server will be running at:');
  console.log('      http://localhost:3000');
  console.log('');
  console.log('   3. Test locally first:');
  console.log('      curl http://localhost:3000/health');
  console.log('');
}

function showTunnelSetup() {
  console.log('🌐 TUNNEL SETUP:');
  console.log('');
  console.log('   1. In a new terminal, create tunnel:');
  console.log('      ngrok http 3000');
  console.log('');
  console.log('   2. You\'ll get output like:');
  console.log('      ┌─────────────────────────────────────────────────┐');
  console.log('      │   ngrok                                         │');
  console.log('      ├─────────────────────────────────────────────────┤');
  console.log('      │   Forwarding  https://abc123.ngrok.io → http://│');
  console.log('      │               localhost:3000                   │');
  console.log('      └─────────────────────────────────────────────────┘');
  console.log('');
  console.log('   3. Your public URL: https://abc123.ngrok.io');
  console.log('');
}

function showCustomDomain() {
  console.log('🎯 CUSTOM DOMAIN (NGROK PRO):');
  console.log('');
  console.log('   With ngrok Pro ($8/month):');
  console.log('   • Get custom subdomain');
  console.log('   • Reserved domain name');
  console.log('   • Password protection');
  console.log('');
  console.log('   Example:');
  console.log('   ngrok http 3000 --subdomain=mangoleads');
  console.log('   → https://mangoleads.ngrok.io');
  console.log('');
}

function showTesting() {
  console.log('🧪 TESTING YOUR TUNNEL:');
  console.log('');
  console.log('   1. Health check:');
  console.log('      curl https://abc123.ngrok.io/health');
  console.log('');
  console.log('   2. Submit test lead:');
  console.log('      curl -X POST https://abc123.ngrok.io/submit-lead \\');
  console.log('        -H "Content-Type: application/json" \\');
  console.log('        -d \'{"name":"Test User","email":"test@example.com","phone":"555-0123"}\'');
  console.log('');
  console.log('   3. Check leads:');
  console.log('      curl https://abc123.ngrok.io/leads');
  console.log('');
}

function showUseCases() {
  console.log('💡 PERFECT FOR:');
  console.log('');
  console.log('   ✅ Quick demos');
  console.log('   ✅ Testing webhooks');
  console.log('   ✅ Sharing with team');
  console.log('   ✅ Mobile testing');
  console.log('   ✅ Client previews');
  console.log('');
  console.log('   ❌ NOT for production');
  console.log('   ❌ Tunnel closes when computer sleeps');
  console.log('   ❌ Limited bandwidth on free tier');
  console.log('');
}

function showAdvancedOptions() {
  console.log('⚙️ ADVANCED OPTIONS:');
  console.log('');
  console.log('   Secure tunnel with basic auth:');
  console.log('   ngrok http 3000 --basic-auth="user:password"');
  console.log('');
  console.log('   Inspect traffic:');
  console.log('   • Open http://localhost:4040');
  console.log('   • View all requests/responses');
  console.log('   • Debug API calls');
  console.log('');
  console.log('   Configuration file (~/.ngrok2/ngrok.yml):');
  console.log('   authtoken: YOUR_AUTH_TOKEN');
  console.log('   tunnels:');
  console.log('     mangoleads:');
  console.log('       proto: http');
  console.log('       addr: 3000');
  console.log('       subdomain: mangoleads');
  console.log('');
  console.log('   Start with config:');
  console.log('   ngrok start mangoleads');
  console.log('');
}

function showStepByStep() {
  console.log('📝 STEP-BY-STEP GUIDE:');
  console.log('');
  console.log('1️⃣ Install ngrok:');
  console.log('   npm install -g ngrok');
  console.log('');
  console.log('2️⃣ Start your server:');
  console.log('   npm run dev');
  console.log('');
  console.log('3️⃣ Open new terminal and create tunnel:');
  console.log('   ngrok http 3000');
  console.log('');
  console.log('4️⃣ Copy the https URL from ngrok output');
  console.log('');
  console.log('5️⃣ Test your API:');
  console.log('   curl https://YOUR-URL.ngrok.io/health');
  console.log('');
  console.log('6️⃣ Share your URL with clients/team');
  console.log('');
  console.log('7️⃣ Monitor traffic at http://localhost:4040');
  console.log('');
}

function main() {
  showNgrokSetup();
  showLocalSetup();
  showTunnelSetup();
  showCustomDomain();
  showTesting();
  showUseCases();
  showAdvancedOptions();
  showStepByStep();
  
  console.log('🎉 Local + Tunnel setup complete!');
  console.log('');
  console.log('💡 Pro tip: Keep your ngrok URL handy for quick demos');
  console.log('💡 For permanent solutions, use Vercel or VPS deployment');
}

if (require.main === module) {
  main();
}

module.exports = main;
