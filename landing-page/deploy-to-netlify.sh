#!/bin/bash
# Deploy Landing Page to Netlify (autotradeiq-reg.store)

echo "🚀 Deploying landing page to Netlify..."
echo "📍 Target domain: autotradeiq-reg.store"
echo

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this from the landing-page directory."
    exit 1
fi

echo "📋 Landing page files to deploy:"
ls -la *.html *.js *.css 2>/dev/null | grep -E '\.(html|js|css)$' || echo "   - index.html"

echo
echo "✅ Ready to deploy to Netlify!"
echo "🔗 After deployment, the landing page will be available at: https://autotradeiq-reg.store"
echo
echo "📌 Manual deployment steps:"
echo "1. Go to: https://app.netlify.com/"
echo "2. Find your autotradeiq-reg.store site"
echo "3. Drag and drop this entire landing-page folder"
echo "4. Wait for deployment to complete"
echo
echo "💡 The landing page is configured to send leads to: https://autotradeiq-crm.space"
echo "🎯 Mock brand configuration: Uses internal CRM storage for safe testing"
