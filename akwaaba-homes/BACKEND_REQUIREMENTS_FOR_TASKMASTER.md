# Backend Requirements for AkwaabaHomes - Taskmaster Reference

## 🎯 Overview
This document outlines the comprehensive backend requirements for AkwaabaHomes based on the PRD and frontend analysis. Use this as a reference when developing the backend implementation.

## 📊 Database Schema Requirements

### 1. Core Entities

#### Properties Table
```sql
- id (UUID, primary key)
- title (VARCHAR, required)
- description (TEXT)
- price_ghs (DECIMAL, required)
- property_type (ENUM: house, apartment, land, commercial)
- listing_type (ENUM: for_sale, for_rent)
- bedrooms (INTEGER)
- bathrooms (INTEGER)
- size_sqft (INTEGER)
- location_coordinates (POINT, required for geo-tagging)
- address (TEXT, required)
- region (VARCHAR, required)
- city (VARCHAR, required)
- neighborhood (VARCHAR)
- verification_status (ENUM: pending, verified, rejected)
- listing_tier (ENUM: basic, standard, premium)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- agent_id (UUID, foreign key)
- images (JSON array of image URLs)
- virtual_tour_url (VARCHAR)
- documents (JSON array of document URLs)
```

#### Users Table
```sql
- id (UUID, primary key)  
- email (VARCHAR, unique, required)
- phone (VARCHAR, required)
- full_name (VARCHAR, required)
- user_type (ENUM: buyer, seller, agent, admin)
- is_verified (BOOLEAN, default false)
- verification_documents (JSON)
- location_country (VARCHAR)
- location_city (VARCHAR)
- preferred_currency (ENUM: GHS, USD, GBP, EUR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Agents Table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- license_number (VARCHAR, required)
- company_name (VARCHAR)
- bio (TEXT)
- specializations (JSON array)
- rating (DECIMAL)
- total_sales (INTEGER)
- verification_status (ENUM: pending, verified, rejected)
- commission_rate (DECIMAL)
```

#### Property Images Table
```sql
- id (UUID, primary key)
- property_id (UUID, foreign key)
- image_url (VARCHAR, required)
- image_type (ENUM: main, gallery, virtual_tour)
- sort_order (INTEGER)
- caption (VARCHAR)
```

## 🔄 API Endpoints Required

### 1. Property Management
```
GET /api/properties - Search and list properties
POST /api/properties - Create new property listing
GET /api/properties/:id - Get property details
PUT /api/properties/:id - Update property
DELETE /api/properties/:id - Delete property
POST /api/properties/:id/images - Upload property images
GET /api/properties/search - Advanced search with filters
```

### 2. User Management
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout
GET /api/auth/me - Get current user
PUT /api/auth/profile - Update user profile
POST /api/auth/verify - Phone/email verification
POST /api/auth/reset-password - Password reset
```

### 3. Currency Conversion
```
GET /api/currency/rates - Get current exchange rates
POST /api/currency/convert - Convert specific amounts
```

### 4. Search & Filters
```
GET /api/search/properties - Property search with filters
GET /api/search/suggestions - Location autocomplete
GET /api/regions - Get all regions/cities
GET /api/neighborhoods - Get neighborhoods by region
```

### 5. Communications
```
POST /api/inquiries - Send inquiry to agent
GET /api/inquiries - Get user's inquiries
PUT /api/inquiries/:id - Update inquiry status
POST /api/inspections/schedule - Schedule property inspection
GET /api/inspections - Get scheduled inspections
```

### 6. Verification System
```
POST /api/verification/property - Submit property for verification
GET /api/verification/status/:id - Check verification status
POST /api/verification/agent - Submit agent verification
PUT /api/verification/approve/:id - Admin approve verification
```

## 🛠 Core Backend Services Needed

### 1. Authentication Service
- JWT-based authentication
- Phone number verification (SMS OTP)
- Email verification
- Password reset functionality
- Role-based access control

### 2. File Upload Service
- Image upload and processing
- Document upload for verification
- Image resizing and optimization
- Secure file storage (AWS S3 or similar)

### 3. Currency Conversion Service
- Real-time exchange rate API integration
- Daily rate caching
- Multi-currency price calculation
- Rate history tracking

### 4. Notification Service
- SMS notifications (property updates, inquiries)
- Email notifications
- WhatsApp integration for communication
- Push notifications (future)

### 5. Search Service
- Full-text search for properties
- Geo-spatial search by coordinates
- Advanced filtering (price, type, size, etc.)
- Search analytics and tracking

### 6. Verification Service
- Document processing and validation
- Agent license verification
- Property document verification
- Manual review workflow

## 🌍 External Integrations Required

### 1. Payment Processing
- **Stripe** - For international payments
- **Mobile Money** - MTN, Vodafone, AirtelTigo
- Subscription management for listing tiers
- Commission processing

### 2. SMS/Communication
- **Twilio** or local SMS gateway
- WhatsApp Business API
- Email service (SendGrid/AWS SES)

### 3. Maps & Location
- **Mapbox** - Map display and geocoding
- Location autocomplete
- Reverse geocoding for addresses

### 4. Currency Data
- **Exchange rate API** (FXRates, CurrencyAPI)
- Real-time rate updates
- Historical rate data

## 🔐 Security Requirements

### 1. Data Protection
- Encrypt sensitive user data
- Secure file uploads
- Input validation and sanitization
- SQL injection prevention

### 2. API Security
- Rate limiting
- CORS configuration
- API key management
- Request/response logging

### 3. User Privacy
- GDPR compliance considerations
- Data retention policies
- User consent management
- Secure document handling

## 📈 Performance Requirements

### 1. Response Times
- Property search: < 500ms
- Property details: < 300ms
- Image loading: < 2s
- Currency conversion: < 200ms

### 2. Scalability
- Support 100k+ property listings
- Handle 10k+ concurrent users
- Database optimization for geo-queries
- CDN for image delivery

## 🎯 Priority Implementation Order

### Phase 1 (MVP)
1. User authentication and registration
2. Property CRUD operations
3. Basic search functionality
4. Image upload and display
5. Currency conversion API

### Phase 2 (Core Features)
1. Advanced search and filters
2. Agent verification system
3. Property verification workflow
4. Communication/inquiry system
5. Mobile money payment integration

### Phase 3 (Advanced Features)
1. Inspection scheduling system
2. Virtual tour integration
3. Analytics and reporting
4. Advanced notifications
5. Mobile app support

## 🔧 Development Environment Setup

### Required Services
- **Database**: PostgreSQL with PostGIS extension
- **Cache**: Redis for session management
- **File Storage**: AWS S3 or compatible
- **Search**: Elasticsearch (optional for advanced search)
- **Queue**: Redis or AWS SQS for background jobs

### Environment Variables Needed
```
DATABASE_URL=
REDIS_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
MAPBOX_ACCESS_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
STRIPE_SECRET_KEY=
CURRENCY_API_KEY=
JWT_SECRET=
```

## 📋 Testing Requirements

### 1. API Testing
- Unit tests for all endpoints
- Integration tests for user flows
- Load testing for search functionality
- Security penetration testing

### 2. Data Testing
- Database migration testing
- Backup and restore procedures
- Data integrity validation
- Performance benchmarking

---

*This document serves as a comprehensive guide for backend development. Each feature should be implemented according to the PRD requirements and tested thoroughly before deployment.*
