#!/usr/bin/env node
/**
 * One-Click GitHub + Netlify Setup for MangoLeads CRM
 */

console.log('🥭 MangoLeads CRM - One-Click Setup');
console.log('================================');
console.log('');

console.log('🚀 SUPER QUICK SETUP (5 minutes total):');
console.log('');

console.log('1️⃣ CREATE GITHUB REPO (1 minute):');
console.log('   👆 Click this link: https://github.com/new?name=mangoleads&description=MangoLeads%20CRM%20-%20Lead%20collection%20platform');
console.log('   ✅ Just click "Create repository" (all settings are pre-filled)');
console.log('');

console.log('2️⃣ UPLOAD YOUR PROJECT (1 minute):');
console.log('   📋 Copy and paste this command in your terminal:');
console.log('');
console.log('   REPLACE "YOUR-USERNAME" with your actual GitHub username:');
console.log('');
console.log('   git remote add origin https://github.com/YOUR-USERNAME/mangoleads.git');
console.log('   git push -u origin main');
console.log('');

console.log('3️⃣ DEPLOY TO NETLIFY (2 minutes):');
console.log('   👆 Click this link: https://app.netlify.com/start');
console.log('   ✅ Choose GitHub → Select "mangoleads" repo → Deploy');
console.log('');

console.log('4️⃣ ADD DATABASE (1 minute):');
console.log('   👆 Click this link: https://supabase.com/dashboard/new');
console.log('   ✅ Create project "mangoleads" → Copy connection string');
console.log('   ✅ In Netlify: Site settings → Environment variables → Add DATABASE_URL');
console.log('');

console.log('🎉 DONE! Your CRM will be live at: https://your-site-name.netlify.app');
console.log('');

console.log('💡 What\'s your GitHub username? I\'ll give you the exact command to copy/paste!');

// Generate a simple setup command
function generateSetupCommand(username) {
  return `
🚀 COPY AND PASTE THIS COMMAND:

git remote add origin https://github.com/${username}/mangoleads.git && git push -u origin main

✅ That's it! Your project will be uploaded to GitHub.
`;
}

console.log('');
console.log('📋 NEED HELP? Run with your username:');
console.log('   node one-click-setup.js YOUR-USERNAME');

// If username provided as argument
if (process.argv[2]) {
  const username = process.argv[2];
  console.log(generateSetupCommand(username));
}

module.exports = { generateSetupCommand };
