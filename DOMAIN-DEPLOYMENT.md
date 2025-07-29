# 🥭 MangoLeads CRM - Domain Deployment Guide

## 🎯 QUICK START: Deploy to Your Domain in 30 Minutes

### Prerequisites
- ✅ GitHub repository (you have this)
- 🌐 Domain name (yoursite.com)
- 💳 Credit card for hosting (optional free tiers available)

---

## 🚀 OPTION 1: VERCEL + PLANETSCALE (RECOMMENDED)

**Perfect for:** Beginners, fast deployment, automatic scaling  
**Cost:** $0-20/month  
**Time:** 30 minutes  

### Step 1: Database Setup (PlanetScale)
```bash
# 1. Go to planetscale.com
# 2. Sign up with GitHub
# 3. Create new database "mangoleads"
# 4. Get connection string
```

### Step 2: Deploy to Vercel
```bash
# 1. Go to vercel.com
# 2. Sign up with GitHub
# 3. Import your mangoleads repository
# 4. Configure environment variables:
#    - DATABASE_URL=<planetscale-connection-string>
#    - JWT_SECRET=<random-secret>
#    - NODE_ENV=production
```

### Step 3: Connect Your Domain
```bash
# In Vercel dashboard:
# 1. Go to Settings > Domains
# 2. Add your domain: yoursite.com
# 3. Update DNS records at your domain registrar:
#    - CNAME: www -> cname.vercel-dns.com
#    - A: @ -> 76.76.19.19
```

### Step 4: SSL & Security
- ✅ SSL automatically configured by Vercel
- ✅ CDN automatically enabled
- ✅ HTTPS redirects enabled

---

## 🛠️ OPTION 2: VPS DEPLOYMENT (FULL CONTROL)

**Perfect for:** Advanced users, custom requirements, full control  
**Cost:** $10-50/month  
**Time:** 2 hours  

### Step 1: Create VPS Server
```bash
# Recommended providers:
# - DigitalOcean: $10/month droplet
# - Linode: $10/month nanode
# - AWS: t3.micro (free tier)

# Choose Ubuntu 22.04 LTS
# Minimum: 2GB RAM, 1 CPU, 50GB storage
```

### Step 2: Server Setup
```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install Redis
apt install redis-server -y

# Install nginx
apt install nginx -y

# Install certbot for SSL
apt install certbot python3-certbot-nginx -y
```

### Step 3: Deploy Application
```bash
# Clone your repository
git clone https://github.com/yourusername/mangoleads.git
cd mangoleads/lead-crm

# Install dependencies
npm install

# Set up environment
cp .env.example .env
nano .env
# Configure:
# - DATABASE_URL=postgresql://username:password@localhost/mangoleads
# - REDIS_URL=redis://localhost:6379
# - JWT_SECRET=your-secret-key
# - NODE_ENV=production

# Set up database
sudo -u postgres createuser --interactive
sudo -u postgres createdb mangoleads
npm run db:setup

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start server.js --name mangoleads
pm2 startup
pm2 save
```

### Step 4: Configure Nginx
```bash
# Create nginx config
nano /etc/nginx/sites-available/mangoleads

# Add configuration:
server {
    listen 80;
    server_name yoursite.com www.yoursite.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/mangoleads /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 5: SSL Certificate
```bash
# Get SSL certificate
certbot --nginx -d yoursite.com -d www.yoursite.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 6: Domain DNS
```bash
# Update DNS at your domain registrar:
# A Record: @ -> your-server-ip
# A Record: www -> your-server-ip
```

---

## 🏠 OPTION 3: LOCAL + TUNNEL (TESTING)

**Perfect for:** Testing, development, demos  
**Cost:** Free  
**Time:** 10 minutes  

### Step 1: Install ngrok
```bash
# Go to ngrok.com and sign up
# Download ngrok
# Or install via npm:
npm install -g ngrok
```

### Step 2: Start Your Server
```bash
# In your project directory
npm run dev
# Server runs on localhost:3000
```

### Step 3: Create Tunnel
```bash
# In another terminal
ngrok http 3000

# You'll get a URL like:
# https://abc123.ngrok.io -> http://localhost:3000
```

### Step 4: Custom Domain (ngrok Pro)
```bash
# With ngrok Pro ($8/month), you can use:
ngrok http 3000 --hostname=yoursite.ngrok.io
```

---

## 🔧 POST-DEPLOYMENT CHECKLIST

### Security
- [ ] Environment variables configured
- [ ] Database password changed
- [ ] JWT secret set
- [ ] HTTPS enabled
- [ ] CORS configured for your domain
- [ ] Rate limiting enabled

### Monitoring
- [ ] Error logging set up
- [ ] Database backups scheduled
- [ ] Server monitoring enabled
- [ ] SSL certificate auto-renewal

### Testing
- [ ] API endpoints working
- [ ] Database connections stable
- [ ] Queue processing active
- [ ] Email notifications working (if enabled)

---

## 🆘 TROUBLESHOOTING

### Common Issues

**1. Database Connection Failed**
```bash
# Check connection string
# Verify database exists
# Check firewall settings
```

**2. 502 Bad Gateway (nginx)**
```bash
# Check if app is running: pm2 status
# Check nginx config: nginx -t
# Check logs: tail -f /var/log/nginx/error.log
```

**3. SSL Certificate Issues**
```bash
# Renew certificate: certbot renew
# Check expiry: certbot certificates
```

**4. Domain Not Resolving**
```bash
# Check DNS propagation: dig yoursite.com
# Wait 24-48 hours for DNS propagation
```

---

## 📞 NEXT STEPS

1. **Choose your deployment option** (Recommended: Option 1)
2. **Get your domain ready** (register if needed)
3. **Follow the step-by-step guide** above
4. **Test everything** with the checklist
5. **Start collecting leads!** 🎉

Need help? Check the troubleshooting section or run:
```bash
npm run status  # Check system health
npm run test    # Verify functionality
```
