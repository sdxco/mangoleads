# Landing Page Configuration

This landing page is designed to submit leads directly to your MangoLeads CRM.

## Setup Instructions

1. **Update Configuration**: Edit the `CONFIG` object in `script.js`:
   ```javascript
   const CONFIG = {
       CRM_URL: 'https://your-crm-domain.com', // Your CRM URL
       BRAND_ID: 'your-brand-id',              // Your brand identifier
       BRAND_NAME: 'Your Brand Name',          // Display name
       AFF_ID: 'your-affiliate-id',            // Your affiliate ID
       OFFER_ID: 'your-offer-id'               // Your offer ID
   };
   ```

2. **Deploy**: Upload these files to your landing page domain

3. **Test**: Make sure your CRM is running and accessible

## Files Included

- `index.html` - Main landing page
- `script.js` - Form handling and CRM integration
- `README.md` - This file

## Features

- ✅ Responsive design (mobile-friendly)
- ✅ Form validation
- ✅ Direct CRM integration
- ✅ Success/error messaging
- ✅ Phone number formatting
- ✅ Country code auto-selection
- ✅ URL parameter tracking (aff_sub)
- ✅ Google Analytics ready
- ✅ Conversion tracking ready

## Testing Locally

1. Start your MangoLeads CRM server
2. Open `index.html` in a browser
3. Fill out the form and submit
4. Check your CRM dashboard for the new lead

## Customization

### Brand/Design
- Update colors, logo, and text in `index.html`
- Modify the gradient background and styling
- Add your own images and branding

### Form Fields
- Add/remove fields as needed
- Update validation rules
- Modify country/phone code lists

### Tracking
- Add Google Analytics tracking code
- Set up Facebook Pixel
- Configure conversion tracking

## Security Notes

- The form submits directly to your CRM API
- No sensitive data is stored on the landing page
- All lead data goes through your secure CRM system

## Support

For issues with the CRM integration, check:
1. CRM server is running
2. CORS is configured properly
3. Brand ID exists in your CRM
4. API endpoint is accessible
