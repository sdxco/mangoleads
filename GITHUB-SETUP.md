# MangoLeads CRM - GitHub Setup Commands

# Run these commands in PowerShell after installing Git:

# 1. Navigate to your project
cd "E:\Users\S\Documents\GIT\mangoleads"

# 2. Initialize Git repository
git init

# 3. Configure Git (replace with your info)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 4. Add all files to staging
git add .

# 5. Create initial commit
git commit -m "🥭 Initial commit: MangoLeads CRM v1.0.0

✨ Features:
- Role-based authentication (Admin/Affiliate)
- Complete lead tracking with IP, phone, location
- Real-time API integration with external CRMs
- Professional glass-morphism UI design
- Affiliate offers system
- Brand management with API configuration
- Production-ready customer interface

🔧 Technical:
- Python HTTP server with REST API
- Vanilla JavaScript frontend
- Tailwind CSS styling
- Token-based authentication
- Field mapping for API integration
- Retry logic with exponential backoff

🎯 Production Status:
- No refresh loops or stuttering
- Stable authentication flow
- Customer-focused messaging
- Complete lead data preservation
- Real-time dashboard updates"

# 6. Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/mangoleads.git

# 7. Push to GitHub
git push -u origin main

# Alternative if main branch doesn't exist:
# git branch -M main
# git push -u origin main
