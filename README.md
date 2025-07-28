# MangoLeads CRM

A modern, high-performance CRM platform for lead collection, storage, and distribution to brands via API. Built in 24 hours as a complete MVP solution.

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.0.0
- **PostgreSQL** ≥ 14.0
- **Redis** ≥ 6.0 (optional but recommended for production)

### Installation

1. **Clone and setup**:
```bash
git clone <your-repo>
cd lead-crm
npm install
```

2. **Environment setup**:
```bash
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)
```

3. **Database setup**:
```bash
npm run setup
```

4. **Test setup**:
```bash
npm run smoke-test
```

5. **Start the server**:
```bash
npm run dev  # Development mode (port 4000)
npm start    # Production mode
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration  
DATABASE_URL=postgres://postgres:postgres@localhost:5432/leads

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# Lead Processing Configuration
TRACKER_URL=https://yourtracker.com
AFF_ID=28215
OFFER_ID=1737
LANDING_DOMAIN=yourlanding.com

# Security
SALT_ROUNDS=10
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 4000 | Server port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | No | - | Redis connection string (fallback to in-memory) |
| `TRACKER_URL` | Yes | - | External tracker endpoint for lead distribution |
| `AFF_ID` | Yes | - | Affiliate ID for tracking |
| `OFFER_ID` | Yes | - | Offer ID for tracking |
| `LANDING_DOMAIN` | Yes | - | Landing page domain |
| `SALT_ROUNDS` | No | 10 | bcrypt salt rounds for password hashing |

## 📁 Project Structure

```
lead-crm/
├── server.js              # Main server file
├── src/
│   ├── controllers/       # Business logic
│   ├── middleware/        # Custom middleware
│   ├── models/           # Data models
│   └── routes/           # API routes
├── database/             # Database migrations & seeds
└── .env.example         # Environment template
```

## 🔧 Development Commands

- `npm run dev` - Start development server with hot reload (port 4000)
- `npm run setup` - Initialize database and schema
- `npm run status` - Check if server is running
- `npm run smoke-test` - Complete functionality test
- `npm run redis-check` - Check Redis status and queue info
- `npm run queue-validation` - Test queue processing end-to-end
- `npm run test:setup` - Test all system components
- `npm run test:api` - Test API endpoints
- `npm run test:db` - Test database connection
- `npm run test:queue` - Test queue system
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm start` - Start production server

## 📊 API Endpoints

### Lead Submission
- **POST** `/submit-lead` - Submit a new lead for processing

**Request Body:**
```json
{
  "first_name": "John",        // Required: string, max 50 chars
  "last_name": "Doe",          // Required: string, max 50 chars
  "email": "john@example.com", // Required: valid email format
  "password": "Abc12345",      // Required: string, min 8 chars
  "phonecc": "+1",             // Required: string, format +1-4 digits
  "phone": "5551234567",       // Required: string, 4-14 digits
  "country": "US",             // Required: 2-char ISO country code
  "referer": "https://...",    // Optional: string
  "aff_sub": "campaign_123",   // Optional: string
  "aff_sub2": "creative_456",  // Optional: string
  "aff_sub4": "placement_789", // Optional: string
  "aff_sub5": "target_abc",    // Optional: string
  "orig_offer": "summer_promo" // Optional: string
}
```

**Response:**
```json
{
  "id": 123,
  "status": "queued"
}
```

**Status Codes:**
- `202 Accepted` - Lead queued for processing
- `400 Bad Request` - Invalid data (see validation rules)
- `500 Internal Server Error` - Server error

### Lead Monitoring
- **GET** `/leads` - Get recent leads (last 100)
- **GET** `/health` - Health check endpoint

**Example Response (`/leads`):**
```json
[
  {
    "id": 123,
    "email": "john@example.com",
    "status": "sent",
    "attempts": 1,
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

### Testing with REST Client
Use the `api-tests.http` file with VS Code's REST Client extension to test endpoints.

## 🧪 Smoke Testing

### Quick Validation
```bash
npm run smoke-test      # Test API + database
npm run queue-validation # Test queue processing
npm run redis-check     # Check Redis status
```

### Manual Testing
```bash
# Test lead submission
curl -X POST http://localhost:4000/submit-lead \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@test.com","password":"Abc12345","phonecc":"+1","phone":"5551234567","country":"US"}'

# Check database
psql -U postgres -d leads -c "SELECT id,email,status FROM leads;"

# Monitor Redis (if running)
redis-cli monitor
```

## 🏗️ Architecture

### System Components
- **Express.js 4.x** - Web framework with security middleware
- **PostgreSQL** - Primary database with connection pooling
- **Redis + BullMQ** - Job queue system (with in-memory fallback)
- **bcrypt** - Password hashing and security
- **Validator.js** - Input validation and sanitization

### Queue Processing Flow
1. **Lead Submission** → Validate input → Hash password → Store in DB
2. **Queue Job** → Add to Redis/memory queue with lead data
3. **Background Worker** → Process job → Send to tracker URL
4. **Status Update** → Update lead status (sent/error) → Retry if failed

### Database Schema
```sql
-- Main leads table
CREATE TABLE leads (
  id            BIGSERIAL PRIMARY KEY,
  first_name    VARCHAR(50) NOT NULL,
  last_name     VARCHAR(50) NOT NULL,
  email         CITEXT UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phonecc       VARCHAR(5) NOT NULL,
  phone         VARCHAR(14) NOT NULL,
  country       CHAR(2) NOT NULL,
  referer       TEXT,
  user_ip       INET NOT NULL,
  aff_id        VARCHAR(20) NOT NULL,
  offer_id      VARCHAR(10) NOT NULL,
  aff_sub       TEXT,
  aff_sub2      TEXT,
  aff_sub3      TEXT,
  aff_sub4      TEXT,
  aff_sub5      TEXT,
  orig_offer    TEXT,
  status        TEXT CHECK (status IN ('queued','sent','error')) DEFAULT 'queued',
  attempts      SMALLINT DEFAULT 0,
  last_error    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔒 Security Features

- **Rate Limiting**: 30 requests per minute per IP
- **Input Validation**: Comprehensive validation using validator.js
- **Password Hashing**: bcrypt with configurable salt rounds
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configured for cross-origin requests
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization

## 📁 Project Structure

```
lead-crm/
├── server.js              # Main Express server
├── db.js                  # Database connection pool
├── queue.js              # Queue system (Redis/in-memory)
├── helpers.js            # Utility functions
├── .env                  # Environment configuration
├── .editorconfig         # Editor configuration
├── .prettierrc           # Code formatting rules
├── eslint.config.js      # Linting configuration
├── api-tests.http        # REST Client test cases
├── database/
│   ├── schema.sql        # Database schema
│   ├── setup.js         # Database setup automation
│   └── db.js            # Legacy database utilities
├── src/
│   ├── models/
│   │   └── Lead.js      # Lead model (legacy)
│   ├── controllers/     # (Reserved for future)
│   ├── middleware/      # (Reserved for future)
│   └── routes/          # (Reserved for future)
├── test-*.js            # Test scripts
└── *.sh                # Shell scripts
```

## 🛠️ Built With

- **Express.js 4.x** - Web framework
- **PostgreSQL** - Database with CITEXT extension
- **Redis + BullMQ** - Queue management (optional)
- **bcrypt** - Password hashing
- **Helmet** - Security middleware
- **Validator.js** - Input validation
- **Axios** - HTTP client for external requests
- **IORedis** - Redis client
- **CORS** - Cross-origin resource sharing

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production` in environment
- [ ] Configure production database URL
- [ ] Set up Redis for production queue processing
- [ ] Configure real tracker URL and credentials
- [ ] Set strong JWT secret and salt rounds
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database

### Environment-Specific Notes

**Development:**
- Uses in-memory queue if Redis unavailable
- Extensive logging and debug output
- Hot reload with nodemon

**Production:**
- Requires Redis for queue persistence
- Minimal logging for performance
- Process management with PM2 recommended

## 📋 TODO List

### Immediate Improvements
- [ ] Add JWT authentication for admin endpoints
- [ ] Implement lead deduplication logic
- [ ] Add email validation with external service
- [ ] Create admin dashboard for lead management
- [ ] Add real-time webhook notifications
- [ ] Implement lead scoring algorithm

### Future Enhancements
- [ ] Add GraphQL API layer
- [ ] Implement lead segmentation
- [ ] Add A/B testing capabilities
- [ ] Create analytics and reporting dashboard
- [ ] Add multi-tenant support
- [ ] Implement GDPR compliance features
- [ ] Add lead nurturing campaigns
- [ ] Create mobile app API
- [ ] Add machine learning for lead qualification
- [ ] Implement advanced fraud detection

### Technical Debt
- [ ] Migrate to TypeScript for better type safety
- [ ] Add comprehensive test suite (Jest/Mocha)
- [ ] Implement database migrations system
- [ ] Add API versioning strategy
- [ ] Create OpenAPI/Swagger documentation
- [ ] Add performance monitoring (APM)
- [ ] Implement caching layer (Redis)
- [ ] Add database read replicas for scaling

## 📞 Support

For support and questions:
- Check the smoke tests: `npm run smoke-test`
- Review logs in console output
- Test individual components with `npm run test:*` commands
- Validate configuration with `npm run diagnostic`

## 📝 License

MIT License - see LICENSE file for details.

---

**🥭 MangoLeads CRM - Built in 24 hours, production-ready from day one!**
