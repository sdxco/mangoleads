# Landing Page Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Files to Upload
Upload these files to your new domain's web root:
```
index.html
script.js
README.md (optional)
```

### 2. Configuration Variables
Before deploying, you can customize these values in `script.js`:

```javascript
const CONFIG = {
    CRM_URL: 'http://autotradeiq-crm.space', // ✅ Already configured
    BRAND_ID: 'trading-platform-demo',       // 🔧 Update per brand in CRM
    BRAND_NAME: 'TradePro',                  // 🔧 Update per brand in CRM  
    AFF_ID: '28215',                         // 🔧 Update per affiliate
    OFFER_ID: '1000'                         // ✅ Set for this landing page
};
```

### 3. Hosting Options

#### Option A: Netlify (Recommended - Free)
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop the `landing-page` folder
3. Your site will be live instantly
4. Optional: Connect custom domain

#### Option B: Vercel (Free)
1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub or upload files
3. Deploy instantly

#### Option C: Traditional Hosting (cPanel/FTP)
1. Connect to your hosting via FTP or File Manager
2. Upload all files to public_html or www folder
3. Access via your domain

#### Option D: GitHub Pages (Free)
1. Push files to GitHub repository
2. Enable GitHub Pages in settings
3. Access via username.github.io/repo-name

### 4. Testing Checklist

After deployment, test these features:

- [ ] Page loads correctly on your domain
- [ ] Country auto-detection works (check browser console)
- [ ] Phone country code populates automatically
- [ ] Form validation works (try submitting empty form)
- [ ] Lead submission works (check CRM dashboard)
- [ ] Success message appears after submission
- [ ] Form resets after successful submission

### 5. CRM Configuration Required

Make sure your CRM server has:

- [ ] CORS enabled for your landing page domain
- [ ] API endpoint `/api/leads` accessible
- [ ] Brand configuration matching your BRAND_ID
- [ ] Database schema supports all lead fields

### 6. Customization for Multiple Landing Pages

For each new landing page:
1. Copy the landing-page folder
2. Update these values in script.js:
   - `BRAND_ID` - Different brand for each landing page
   - `BRAND_NAME` - Different brand name
   - `AFF_ID` - Specific to each affiliate
   - `OFFER_ID` - Unique offer ID (1001, 1002, etc.)
3. Deploy to different domain/subdomain

### 7. Monitoring & Analytics

The landing page includes:
- Google Analytics event tracking (configure gtag)
- Console logging for debugging
- Error handling and user feedback
- Form interaction tracking

### 8. Security Notes

- Uses HTTPS API calls when possible
- Input validation on both frontend and backend
- No sensitive data stored in frontend code
- CORS protection on CRM server

---

## 🔧 Quick Start Commands

### For Netlify Deployment:
```bash
# Zip the landing page folder
cd /Users/seandex/Mangoleads/
zip -r landing-page.zip landing-page/

# Upload landing-page.zip to Netlify
```

### For FTP Deployment:
```bash
# Upload these files to your web root:
scp landing-page/* user@yourserver.com:/public_html/
```

---

## 📞 Testing the Integration

1. **Deploy the landing page** to your chosen hosting
2. **Open the page** in a browser
3. **Fill out the form** with test data
4. **Submit the form**
5. **Check your CRM dashboard** at http://autotradeiq-crm.space for the new lead

If leads don't appear, check:
- Browser console for JavaScript errors
- Network tab for API call failures
- CRM server logs for errors
- CORS configuration on CRM server
