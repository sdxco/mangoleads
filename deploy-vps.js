#!/usr/bin/env node
/**
 * VPS Deploy Script for MangoLeads CRM
 * Complete server setup automation
 */

console.log('🛠️ MangoLeads CRM - VPS Deployment Guide');
console.log('========================================');
console.log('');

function showServerRequirements() {
  console.log('📋 SERVER REQUIREMENTS:');
  console.log('');
  console.log('   Minimum Specs:');
  console.log('   • CPU: 1 vCore');
  console.log('   • RAM: 2GB');
  console.log('   • Storage: 50GB SSD');
  console.log('   • OS: Ubuntu 22.04 LTS');
  console.log('');
  console.log('   Recommended Providers:');
  console.log('   • DigitalOcean: $10/month droplet');
  console.log('   • Linode: $10/month nanode');
  console.log('   • Vultr: $10/month instance');
  console.log('   • AWS: t3.small (~$15/month)');
  console.log('');
}

function showSetupScript() {
  console.log('🚀 SERVER SETUP SCRIPT:');
  console.log('');
  console.log('   Save this as setup-server.sh and run on your VPS:');
  console.log('');
  
  const setupScript = `#!/bin/bash
# MangoLeads CRM - VPS Setup Script

echo "🥭 Setting up MangoLeads CRM server..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install nginx
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Install PM2 globally
sudo npm install -g pm2

# Create mangoleads user
sudo adduser --disabled-password --gecos "" mangoleads
sudo usermod -aG sudo mangoleads

# Switch to mangoleads user for app setup
sudo -u mangoleads bash << 'EOF'
cd /home/mangoleads

# Clone repository
git clone https://github.com/YOUR_USERNAME/mangoleads.git
cd mangoleads/lead-crm

# Install dependencies
npm install

# Create environment file
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://mangoleads:PASSWORD@localhost/mangoleads
REDIS_URL=redis://localhost:6379
JWT_SECRET=CHANGE_THIS_SECRET_KEY
ENVEOF

echo "✅ Application files ready"
EOF

# Set up PostgreSQL
sudo -u postgres bash << 'EOF'
createuser --interactive mangoleads
createdb mangoleads -O mangoleads
psql -c "ALTER USER mangoleads WITH PASSWORD 'CHANGE_THIS_PASSWORD';"
EOF

# Set up database schema
cd /home/mangoleads/mangoleads/lead-crm
sudo -u mangoleads npm run db:setup

echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Update passwords in /home/mangoleads/mangoleads/lead-crm/.env"
echo "2. Configure nginx (see nginx-config.sh)"
echo "3. Set up SSL (see ssl-setup.sh)"
echo "4. Start the application (see start-app.sh)"`;

  console.log(setupScript);
  console.log('');
}

function showNginxConfig() {
  console.log('🌐 NGINX CONFIGURATION:');
  console.log('');
  console.log('   Save this as nginx-config.sh:');
  console.log('');
  
  const nginxScript = `#!/bin/bash
# Nginx configuration for MangoLeads CRM

# Create nginx site configuration
sudo tee /etc/nginx/sites-available/mangoleads << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/mangoleads /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx configured successfully"`;

  console.log(nginxScript);
  console.log('');
}

function showSSLSetup() {
  console.log('🔒 SSL CERTIFICATE SETUP:');
  console.log('');
  console.log('   Save this as ssl-setup.sh:');
  console.log('');
  
  const sslScript = `#!/bin/bash
# SSL setup for MangoLeads CRM

# Get SSL certificate
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com

# Set up auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# Test auto-renewal
sudo certbot renew --dry-run

echo "✅ SSL certificate installed and auto-renewal configured"`;

  console.log(sslScript);
  console.log('');
}

function showApplicationStart() {
  console.log('🚀 START APPLICATION:');
  console.log('');
  console.log('   Save this as start-app.sh:');
  console.log('');
  
  const startScript = `#!/bin/bash
# Start MangoLeads CRM application

cd /home/mangoleads/mangoleads/lead-crm

# Start with PM2
pm2 start server.js --name mangoleads

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs

echo "✅ Application started and configured for auto-start"
echo ""
echo "Check status with: pm2 status"
echo "View logs with: pm2 logs mangoleads"`;

  console.log(startScript);
  console.log('');
}

function showDeploymentSteps() {
  console.log('📝 DEPLOYMENT STEPS:');
  console.log('');
  console.log('1️⃣ Create VPS server (Ubuntu 22.04)');
  console.log('2️⃣ Update YOUR_USERNAME in setup-server.sh');
  console.log('3️⃣ Run: bash setup-server.sh');
  console.log('4️⃣ Update YOUR_DOMAIN in nginx-config.sh');
  console.log('5️⃣ Run: bash nginx-config.sh');
  console.log('6️⃣ Update DNS records for your domain');
  console.log('7️⃣ Run: bash ssl-setup.sh');
  console.log('8️⃣ Run: bash start-app.sh');
  console.log('9️⃣ Test your API endpoints');
  console.log('');
}

function showDNSConfiguration() {
  console.log('🌍 DNS CONFIGURATION:');
  console.log('');
  console.log('   At your domain registrar, set these DNS records:');
  console.log('');
  console.log('   A Record:');
  console.log('   • Name: @');
  console.log('   • Value: YOUR_SERVER_IP');
  console.log('   • TTL: 300');
  console.log('');
  console.log('   A Record:');
  console.log('   • Name: www');
  console.log('   • Value: YOUR_SERVER_IP');
  console.log('   • TTL: 300');
  console.log('');
  console.log('   Wait 5-30 minutes for DNS propagation');
  console.log('');
}

function showTesting() {
  console.log('🧪 TESTING YOUR DEPLOYMENT:');
  console.log('');
  console.log('   1. Health check:');
  console.log('      curl https://yoursite.com/health');
  console.log('');
  console.log('   2. Submit test lead:');
  console.log('      curl -X POST https://yoursite.com/submit-lead \\');
  console.log('        -H "Content-Type: application/json" \\');
  console.log('        -d \'{"name":"Test User","email":"test@example.com","phone":"555-0123"}\'');
  console.log('');
  console.log('   3. Check leads:');
  console.log('      curl https://yoursite.com/leads');
  console.log('');
}

function main() {
  showServerRequirements();
  showSetupScript();
  showNginxConfig();
  showSSLSetup();
  showApplicationStart();
  showDeploymentSteps();
  showDNSConfiguration();
  showTesting();
  
  console.log('🎉 VPS deployment guide complete!');
  console.log('');
  console.log('💡 Remember to:');
  console.log('   • Replace YOUR_USERNAME with your GitHub username');
  console.log('   • Replace YOUR_DOMAIN with your actual domain');
  console.log('   • Update database passwords');
  console.log('   • Configure firewall (ufw enable)');
  console.log('   • Set up monitoring and backups');
}

if (require.main === module) {
  main();
}

module.exports = main;
