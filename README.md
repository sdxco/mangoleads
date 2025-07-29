# MangoLeads CRM - External API Integration

A comprehensive lead management system with support for external brand API integrations.

## 🚀 Features

### Core CRM Functionality
- **Lead Management Dashboard** - View, manage, and track leads
- **Multi-Brand Support** - Handle multiple brands with different configurations
- **Real-time Analytics** - Lead statistics and performance metrics
- **API Integration Modal** - Easy testing interface for API endpoints

### External API Integration
- **Automatic Lead Forwarding** - Seamlessly forward leads to external brand APIs
- **Custom Field Mapping** - Map internal fields to external API requirements
- **Authentication Support** - Bearer tokens, custom headers, and more
- **Status Tracking** - Real-time status updates based on external API responses
- **Error Handling** - Robust error handling and retry mechanisms

### Landing Page System
- **Production-Ready Landing Pages** - Responsive, optimized lead capture pages
- **IP-based Auto-Detection** - Automatic country and phone code population
- **Form Validation** - Client and server-side validation
- **Direct CRM Integration** - Forms submit directly to CRM API

## 🏗️ Project Structure

```
/Users/seandex/Mangoleads/
├── lead-crm/                    # Main CRM Application
│   ├── public/                  # Dashboard frontend
│   │   ├── index.html          # Main dashboard interface
│   │   └── dashboard.js        # Dashboard functionality + API modal
│   ├── src/                    # Backend source code
│   ├── brands-config.js        # Brand configurations & external API logic
│   ├── server.js              # Main server with external API integration
│   └── package.json           # Dependencies and scripts
├── landing-page/               # Standalone Landing Page
│   ├── index.html             # Production landing page
│   ├── script.js              # Form handling & CRM integration
│   ├── DEPLOYMENT-GUIDE.md    # Deployment instructions
│   └── README.md              # Landing page documentation
└── test-external-integration.js # Integration testing suite
```

## 🔧 Setup & Installation

### 1. CRM Server Setup
```bash
cd lead-crm
npm install
npm start
```
Server runs on `http://localhost:4000`

### 2. Landing Page Deployment
The landing page is deployed to: `https://autotradeiq-reg.store`

For local testing:
```bash
cd landing-page
# Open index.html in browser or serve with static server
python -m http.server 8080
```

### 3. Database Setup
Ensure PostgreSQL is running and configured in `.env` file.

## 🌟 Current Brand Integrations

### Dekikoy Trading Platform (External API)
- **Domain**: https://vip.dekikoy.com/tracker
- **Offer ID**: 1737
- **Affiliate ID**: 28215
- **Type**: External API integration with JWT authentication
- **Status**: ✅ Active and configured

### Demo Brands (Internal)
- **trading-platform-demo**: Internal testing brand
- **forex-broker-demo**: Internal testing brand

## 🧪 Testing External Integration

Run the comprehensive test suite:
```bash
node test-external-integration.js
```

This will:
1. Test internal brand processing
2. Test external API integration with Dekikoy
3. Verify lead storage in CRM database
4. Check error handling for invalid brands

## 📡 API Endpoints

### Submit Lead
```http
POST /api/leads
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe", 
  "email": "john@example.com",
  "phonecc": "+1",
  "phone": "1234567890",
  "country": "US",
  "brand_id": "dekikoy-trading",
  "aff_id": "28215",
  "offer_id": "1737"
}
```

### Get Leads
```http
GET /api/leads
```

### API Testing Modal
Access via the floating gear button in the CRM dashboard for easy API testing.

## 🔄 External API Integration Flow

1. **Lead Submission** → Landing page submits to CRM
2. **Brand Detection** → CRM identifies brand type (internal/external)
3. **External Processing** → For external brands:
   - Map fields according to brand configuration
   - Add authentication headers
   - Submit to external API endpoint
   - Update lead status based on response
4. **Status Tracking** → Real-time status updates in CRM dashboard

## 🎯 Adding New External Brands

To add a new external brand integration:

1. **Update brands-config.js**:
```javascript
'new-brand-id': {
  name: 'New Brand Name',
  trackerUrl: 'https://api.newbrand.com/leads',
  affId: 'your-aff-id',
  offerId: 'your-offer-id',
  token: 'your-auth-token',
  active: true,
  type: 'external',
  headers: {
    'Authorization': 'Bearer your-token',
    'Content-Type': 'application/json'
  },
  fieldMapping: {
    'first_name': 'firstName',
    'last_name': 'lastName'
    // Add field mappings as needed
  }
}
```

2. **Test Integration**:
```bash
# Update test script with new brand_id
node test-external-integration.js
```

3. **Deploy**: Restart CRM server to load new configuration

## 📊 Dashboard Features

- **15-Column Lead Table** - Comprehensive lead information display
- **Status Color Coding** - Visual status indicators
- **Real-time Refresh** - Auto-updating dashboard
- **API Integration Modal** - Click the gear button for API testing
- **Multi-brand Analytics** - Performance metrics per brand

## 🌐 Domain Configuration

- **CRM**: `http://autotradeiq-crm.space` (production)
- **Landing Page**: `https://autotradeiq-reg.store` (production)
- **CORS**: Configured for cross-domain communication

## 🔒 Security Features

- **Input Validation** - Server-side validation for all inputs
- **CORS Protection** - Restricted cross-origin access
- **Rate Limiting** - API rate limiting protection
- **Authentication** - JWT token support for external APIs

## 📈 Next Steps

1. **Monitor Performance** - Track external API response times
2. **Add More Brands** - Integrate additional external brand APIs
3. **Enhanced Analytics** - Conversion tracking and performance metrics
4. **A/B Testing** - Landing page optimization
5. **Mobile Optimization** - Enhanced mobile experience

## 🐛 Troubleshooting

### Common Issues:
- **CORS Errors**: Check server.js CORS configuration
- **External API Failures**: Check brand configuration and authentication tokens
- **Database Errors**: Verify PostgreSQL connection and schema
- **Landing Page Issues**: Check DNS propagation for domain

### Debug Mode:
Check browser console and server logs for detailed error information.

---

**Ready for Production** ✅
- Landing page deployed and accessible
- External API integration working
- CRM dashboard functional
- Testing suite available
