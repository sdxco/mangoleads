# 🥭 MangoLeads CRM - Multi-Brand API Documentation

## 🚀 **Overview**

MangoLeads CRM now supports **multiple brands** with different configurations, tracker URLs, and requirements. Each brand can have its own affiliate ID, offer ID, and specific field requirements.

---

## 📋 **API Endpoints**

### **1. Submit Lead (Multi-Brand)**

**POST** `/submit-lead`

Submit a lead to a specific brand.

#### **Request Body:**
```json
{
  "brand_id": "trading-platform-demo",
  "first_name": "John",
  "last_name": "Doe", 
  "email": "john@example.com",
  "phonecc": "+1",
  "phone": "5551234567",
  "country": "US",
  "age": 25,
  "referer": "google.com",
  "aff_sub": "campaign1",
  "aff_sub2": "source2"
}
```

#### **Required Fields:**
- `brand_id` - Brand identifier (required)
- `first_name` - Lead's first name
- `last_name` - Lead's last name  
- `email` - Valid email address
- `phonecc` - Phone country code (e.g., "+1", "+44")
- `phone` - Phone number (4-14 digits)
- `country` - ISO 3166-1 alpha-2 country code

#### **Optional Fields:**
- `age` - Age (18-100, required for some brands)
- `referer` - Referring website
- `aff_sub`, `aff_sub2`, `aff_sub4`, `aff_sub5` - Affiliate sub-IDs
- `orig_offer` - Original offer information

#### **Response:**
```json
{
  "id": 123,
  "status": "queued", 
  "brand": "Trading Platform Demo",
  "brand_id": "trading-platform-demo"
}
```

#### **Error Responses:**
```json
// Missing brand_id
{
  "error": "brand_id is required"
}

// Invalid brand
{
  "error": "Invalid brand_id"
}

// Missing required fields
{
  "error": "Missing required fields",
  "missing": ["age"],
  "brand": "Crypto Exchange Demo"
}

// Invalid field format
{
  "error": "Invalid field format"
}
```

---

### **2. Get Leads**

**GET** `/leads`

Retrieve leads with optional filtering.

#### **Query Parameters:**
- `brand_id` - Filter by brand ID
- `status` - Filter by status (`queued`, `sent`, `error`)
- `limit` - Number of results (max 1000, default 100)

#### **Examples:**
```bash
# Get all leads
GET /leads

# Get leads for specific brand
GET /leads?brand_id=trading-platform-demo

# Get failed leads
GET /leads?status=error&limit=50

# Get recent leads for brand
GET /leads?brand_id=forex-broker-demo&limit=20
```

#### **Response:**
```json
[
  {
    "id": 123,
    "brand_id": "trading-platform-demo",
    "brand_name": "Trading Platform Demo", 
    "email": "john@example.com",
    "status": "sent",
    "attempts": 1,
    "created_at": "2025-01-15T10:30:00Z",
    "sent_at": "2025-01-15T10:30:15Z"
  }
]
```

---

### **3. Get Available Brands**

**GET** `/brands`

Get all active brands and their configurations.

#### **Response:**
```json
{
  "trading-platform-demo": {
    "name": "Trading Platform Demo",
    "trackerUrl": "https://httpbin.org/post",
    "affId": "28215",
    "offerId": "1737", 
    "active": true,
    "requirements": ["first_name", "last_name", "email", "phonecc", "phone", "country"],
    "description": "Demo trading platform for testing"
  },
  "crypto-exchange-demo": {
    "name": "Crypto Exchange Demo",
    "trackerUrl": "https://httpbin.org/post",
    "affId": "78901", 
    "offerId": "5432",
    "active": true,
    "requirements": ["first_name", "last_name", "email", "phonecc", "phone", "country", "age"],
    "description": "Demo crypto exchange - requires age field"
  }
}
```

---

### **4. Get Brand Statistics**

**GET** `/brands/stats`

Get performance statistics for all brands.

#### **Response:**
```json
[
  {
    "brand_id": "trading-platform-demo",
    "brand_name": "Trading Platform Demo",
    "total_leads": 150,
    "sent_leads": 142,
    "queued_leads": 3,
    "error_leads": 5,
    "success_rate": "94.67"
  },
  {
    "brand_id": "forex-broker-demo", 
    "brand_name": "Forex Broker Demo",
    "total_leads": 89,
    "sent_leads": 85,
    "queued_leads": 1,
    "error_leads": 3,
    "success_rate": "95.51"
  }
]
```

---

### **5. Health Check**

**GET** `/health`

Check if the API is operational.

#### **Response:**
```
OK
```

---

## 🏷️ **Available Demo Brands**

### **trading-platform-demo**
- **Name:** Trading Platform Demo
- **Requirements:** Basic fields (no age required)
- **Use for:** General trading platform leads

### **forex-broker-demo** 
- **Name:** Forex Broker Demo
- **Requirements:** Basic fields (no age required)
- **Use for:** Forex trading leads

### **crypto-exchange-demo**
- **Name:** Crypto Exchange Demo  
- **Requirements:** Basic fields + age (required)
- **Use for:** Cryptocurrency trading leads

---

## 🧪 **Testing Examples**

### **Submit Lead to Trading Platform:**
```bash
curl -X POST https://mangoleads-production.up.railway.app/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "trading-platform-demo",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com", 
    "phonecc": "+1",
    "phone": "5551234567",
    "country": "US"
  }'
```

### **Submit Lead to Crypto Exchange (requires age):**
```bash
curl -X POST https://mangoleads-production.up.railway.app/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "crypto-exchange-demo",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "phonecc": "+44", 
    "phone": "7123456789",
    "country": "GB",
    "age": 28
  }'
```

### **Get Brand Statistics:**
```bash
curl https://mangoleads-production.up.railway.app/brands/stats
```

### **Get Leads for Specific Brand:**
```bash
curl "https://mangoleads-production.up.railway.app/leads?brand_id=trading-platform-demo&limit=10"
```

---

## ⚙️ **Adding New Brands**

To add a new brand, edit `brands-config.js`:

```javascript
'your-new-brand': {
  name: 'Your Brand Name',
  trackerUrl: 'https://your-tracker.com/api/leads',
  affId: 'your-affiliate-id',
  offerId: 'your-offer-id', 
  active: true,
  requirements: ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country'],
  description: 'Description of your brand'
}
```

---

## 🔄 **Lead Processing Flow**

1. **Lead Submitted** → Validated against brand requirements
2. **Stored in Database** → With brand-specific information
3. **Queued for Processing** → Added to background queue
4. **Sent to Brand** → Using brand's tracker URL
5. **Status Updated** → `sent` (success) or `error` (failed)
6. **Retry Logic** → Failed leads retried up to 3 times

---

## 📊 **Status Codes**

- **`queued`** - Lead submitted and waiting to be processed
- **`sent`** - Lead successfully sent to brand
- **`error`** - Lead failed to send after 3 attempts

---

## 🛡️ **Security Features**

- ✅ Rate limiting (30 requests per minute)
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ SQL injection prevention  
- ✅ XSS protection with Helmet
- ✅ Email format validation
- ✅ Phone number format validation
- ✅ Country code validation
