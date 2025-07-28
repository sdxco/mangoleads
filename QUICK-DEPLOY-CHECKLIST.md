# 🥭 MangoLeads CRM - Quick Deployment Checklist

## ✅ **STEP 1: PlanetScale Database Setup (5 minutes)**

1. **Go to PlanetScale:**
   - Visit: https://planetscale.com
   - Click "Sign up with GitHub"
   - Authorize with your GitHub account

2. **Create Database:**
   - Click "Create a database"
   - Name: `mangoleads`
   - Region: Choose closest to your users
   - Click "Create database"

3. **Get Connection String:**
   - Go to "Connect" tab
   - Select "Connect with: Node.js"
   - Copy the DATABASE_URL (looks like: `mysql://username:password@host/mangoleads?sslaccept=strict`)

---

## ✅ **STEP 2: Vercel Deployment (10 minutes)**

1. **Go to Vercel:**
   - Visit: https://vercel.com
   - Click "Sign up with GitHub"
   - Authorize with your GitHub account

2. **Import Repository:**
   - Click "New Project"
   - Find your `mangoleads` repository
   - Click "Import"

3. **Configure Environment Variables:**
   ```
   DATABASE_URL = mysql://username:password@host/mangoleads?sslaccept=strict
   JWT_SECRET = cb2a5b22ff37ac8b8b308413130c0b3ace33523d1dde7e65fa319263c3455054
   NODE_ENV = production
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete (~2 minutes)
   - You'll get a URL like: `https://mangoleads-abc123.vercel.app`

---

## ✅ **STEP 3: Domain Connection (10 minutes)**

1. **Add Domain in Vercel:**
   - Go to your project dashboard
   - Click "Settings" → "Domains"
   - Add your domain: `yoursite.com`
   - Add www version: `www.yoursite.com`

2. **Update DNS Records:**
   Go to your domain registrar (GoDaddy, Namecheap, etc.) and add:
   
   **A Record:**
   - Name: `@`
   - Value: `76.76.19.19`
   - TTL: `300`
   
   **CNAME Record:**
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: `300`

3. **Wait for DNS Propagation:**
   - Usually takes 5-30 minutes
   - Check with: `dig yoursite.com`

---

## ✅ **STEP 4: Database Initialization (2 minutes)**

1. **Access Vercel Terminal:**
   - In Vercel dashboard → Functions tab
   - Or use Vercel CLI: `vercel --login`

2. **Initialize Database:**
   ```bash
   npm run db:setup
   ```

---

## ✅ **STEP 5: Testing (5 minutes)**

1. **Health Check:**
   ```bash
   curl https://yoursite.com/health
   ```
   Expected: `{"status":"healthy","timestamp":"..."}`

2. **Submit Test Lead:**
   ```bash
   curl -X POST https://yoursite.com/submit-lead \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","phone":"555-0123","company":"Test Co"}'
   ```
   Expected: `{"success":true,"message":"Lead submitted successfully"}`

3. **Check Leads:**
   ```bash
   curl https://yoursite.com/leads
   ```
   Expected: Array with your test lead

---

## 🎉 **YOU'RE LIVE!**

Your MangoLeads CRM is now live at:
- **Main site:** https://yoursite.com
- **API endpoint:** https://yoursite.com/submit-lead
- **Admin panel:** https://yoursite.com/leads

### **Your Live API Endpoints:**
```
POST https://yoursite.com/submit-lead
GET  https://yoursite.com/leads  
GET  https://yoursite.com/health
```

### **Next Steps:**
1. **Test with real data** from your forms
2. **Set up monitoring** (optional)
3. **Add email notifications** (optional)
4. **Create frontend interface** (optional)

---

## 🔧 **Configuration Summary:**

**Environment Variables Set:**
- ✅ DATABASE_URL (PlanetScale connection)
- ✅ JWT_SECRET (secure random key)
- ✅ NODE_ENV (production)

**DNS Records Set:**
- ✅ A record: @ → 76.76.19.19
- ✅ CNAME record: www → cname.vercel-dns.com

**Database:**
- ✅ PlanetScale database created
- ✅ Schema initialized
- ✅ Connection tested

**Security:**
- ✅ HTTPS enabled automatically
- ✅ CORS configured
- ✅ Rate limiting active
- ✅ Input validation enabled

---

## 📞 **Need Help?**

**Common Issues:**
- **503 errors:** Check environment variables
- **Database errors:** Verify DATABASE_URL format
- **Domain not working:** Wait for DNS propagation (up to 48 hours)

**Support:**
- Check deployment logs in Vercel dashboard
- Test API endpoints with curl
- Verify DNS with: `nslookup yoursite.com`

**Total Setup Time:** ~30 minutes
**Monthly Cost:** $0-20 (free tiers available)
