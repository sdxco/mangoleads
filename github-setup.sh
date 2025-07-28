#!/bin/bash
# GitHub Repository Setup for MangoLeads CRM
# This script helps you create and upload your project to GitHub

echo "🥭 MangoLeads CRM - GitHub Repository Setup"
echo "=========================================="
echo ""

echo "📋 STEP 1: Create GitHub Repository"
echo ""
echo "1. Go to: https://github.com/new"
echo "2. Repository name: mangoleads"
echo "3. Description: MangoLeads CRM - Lead collection and distribution platform"
echo "4. Keep it PUBLIC (easier for Netlify)"
echo "5. DON'T add README, .gitignore, or license (we already have them)"
echo "6. Click 'Create repository'"
echo ""

echo "📋 STEP 2: After creating the repository, GitHub will show you commands"
echo "Instead of those commands, run this script with your GitHub username:"
echo ""
echo "Usage: ./github-setup.sh YOUR_GITHUB_USERNAME"
echo ""

if [ -z "$1" ]; then
    echo "❌ Please provide your GitHub username"
    echo "Example: ./github-setup.sh yourusername"
    exit 1
fi

USERNAME=$1
echo "🚀 Setting up repository for username: $USERNAME"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from your lead-crm directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Add GitHub remote
echo "🔗 Adding GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/$USERNAME/mangoleads.git

# Add all files
echo "📁 Adding all project files..."
git add .

# Commit if there are changes
if ! git diff --cached --quiet; then
    echo "💾 Committing final changes..."
    git commit -m "Initial commit: Complete MangoLeads CRM platform

🥭 MangoLeads CRM - Production Ready
===================================

Features:
✅ Lead collection API (/submit-lead)
✅ Lead management (/leads)
✅ PostgreSQL database with optimized schema
✅ Redis queue system with fallback
✅ Comprehensive security (bcrypt, validation, rate limiting)
✅ Complete test suite
✅ Multiple deployment options (Vercel, VPS, Local)
✅ Health monitoring and diagnostics
✅ Production-ready configuration

Deployment:
- Ready for Netlify, Vercel, or VPS deployment
- Environment variables configured
- Database schema included
- Comprehensive documentation

Tech Stack:
- Node.js 18+ / Express.js 4.x
- PostgreSQL 14+ / Redis
- bcrypt / validator.js / helmet
- BullMQ queue system
- ESLint / Prettier"
fi

# Push to GitHub
echo "🚀 Uploading to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your repository is now live at:"
    echo "https://github.com/$USERNAME/mangoleads"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "1. ✅ GitHub repository created and uploaded"
    echo "2. 🚀 Deploy to Netlify: https://netlify.com"
    echo "3. 🗄️ Set up database: https://supabase.com"
    echo "4. 🌐 Connect your domain"
    echo ""
    echo "💡 Ready for Netlify deployment!"
else
    echo ""
    echo "❌ Upload failed. Please check:"
    echo "1. Make sure you created the GitHub repository first"
    echo "2. Check your GitHub username is correct"
    echo "3. Ensure you have git configured:"
    echo "   git config --global user.name 'Your Name'"
    echo "   git config --global user.email 'your@email.com'"
fi
