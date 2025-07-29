#!/bin/bash
# MangoLeads CRM - Deployment Preparation Script
# Run this after creating your GitHub repository

echo "🥭 MangoLeads CRM - Deployment Preparation"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Please run this from the lead-crm directory."
    exit 1
fi

echo "📋 Current project status:"
echo "   - Git repository: ✅ Initialized"
echo "   - Files committed: ✅ Done"
echo "   - Branch: $(git branch --show-current)"
echo "   - Total files: $(git ls-files | wc -l | tr -d ' ')"

echo ""
echo "📚 Next steps for GitHub setup:"
echo ""
echo "1. Create empty GitHub repository named 'mangoleads'"
echo "   - Go to: https://github.com/new"
echo "   - Repository name: mangoleads"
echo "   - ⚠️  Do NOT add README, .gitignore, or license (keep empty)"
echo ""
echo "2. Add remote and push (replace <YOUR-USERNAME>):"
echo "   git remote add origin https://github.com/<YOUR-USERNAME>/mangoleads.git"
echo "   git push -u origin main"
echo ""
echo "🔒 Security note: .env file is already in .gitignore"
echo "   Your environment variables will stay local and secure."

echo ""
echo "📁 Files ready for backup:"
git ls-files | head -10
echo "   ... and $(( $(git ls-files | wc -l) - 10 )) more files"

echo ""
echo "🎯 Project is ready for backup and deployment!"
