# System Patterns - AkwaabaHomes

## Architecture Overview

### Component Hierarchy
```
App (Layout)
├── Header (Global Navigation)
├── Page Components
│   ├── HomePage
│   │   ├── HeroSection (with SearchBar)
│   │   ├── FeaturedProperties
│   │   ├── TrustIndicators
│   │   └── DiasporaSection
│   ├── SearchPage
│   │   ├── SearchBar (refinement)
│   │   ├── AdvancedFilters (sidebar)
│   │   ├── PropertyCard (grid/list)
│   │   └── Pagination
│   └── PropertyDetailsPage
│       ├── PropertyImageGallery
│       ├── PropertyMap
│       ├── ContactSellerForm
│       └── InspectionScheduler
└── Footer (if implemented)
```

### Key Design Patterns

#### 1. Ghana Cultural Integration
- **Color System**: Ghana flag colors (red: #C21807, gold: #FFD700, green: #00A86B)
- **Welcoming Language**: "Akwaaba" (Welcome) throughout the platform
- **Local Context**: Plus codes, mobile money, WhatsApp integration
- **Currency Hierarchy**: GHS primary, others as conversions

#### 2. Diaspora-First Features
- **Multi-Currency Display**: 
  ```typescript
  interface DiasporaFeatures {
    multiCurrencyDisplay: boolean;
    inspectionScheduling: boolean;
    virtualTourAvailable: boolean;
    familyRepresentativeContact?: string;
  }
  ```
- **Inspection Coordination**: Three modes (self, family, representative)
- **Remote Communication**: WhatsApp, email, video tours
- **Trust Building**: Seller verification badges, document validation

#### 3. Verification System
```typescript
interface VerificationFlow {
  seller: {
    idVerification: boolean;
    licenseCheck: boolean; // For agents
    phoneVerification: boolean;
  };
  property: {
    geoTagging: boolean; // Mandatory
    documentUpload: boolean;
    adminReview: boolean;
  };
}
```

## Data Flow Patterns

### Property Data Structure
```typescript
Property (Core Entity)
├── Basic Info (title, description, price in GHS)
├── Location (mandatory geo-tagging)
├── Specifications (bedrooms, bathrooms, size)
├── Media (images, videos, virtual tours)
├── Seller (verified contact information)
├── Verification (trust indicators)
├── Tier (basic/standard/premium visibility)
└── DiasporaFeatures (specialized services)
```

### Search & Filter Architecture
```typescript
SearchFilters
├── Location (text + coordinates)
├── PropertyType (house, apartment, land, etc.)
├── PriceRange (with currency conversion)
├── Specifications (beds, baths, size)
├── Features & Amenities (array matching)
├── VerifiedOnly (trust filter)
└── Tier (visibility preferences)
```

### State Management Patterns
- **URL State**: Search filters and pagination in URL params
- **Component State**: Form inputs, UI toggles, modal states
- **Planned Global State**: User preferences, saved searches, cart-like features

## UI/UX Patterns

### Responsive Breakpoints
```css
/* Mobile-first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Component Variants
- **PropertyCard**: Grid vs List view modes
- **SearchBar**: Basic (homepage) vs Advanced (search page)
- **Buttons**: Ghana-themed, outline, ghost variations
- **Badges**: Verification, status, tier indicators

### Animation Patterns
- **Entrance Animations**: Staggered fade-in for property cards
- **Hover Effects**: Subtle transforms and shadows
- **Loading States**: Skeleton screens and spinners
- **Transitions**: Smooth view mode changes

## Communication Patterns

### Contact Methods (Priority Order)
1. **WhatsApp**: Primary for Ghana market
2. **Phone Call**: Direct connection
3. **Email**: Formal inquiries
4. **In-App Forms**: Structured communication

### Notification Patterns
```typescript
ContactPreferences {
  whatsapp: boolean;    // High engagement
  sms: boolean;         // Reliable delivery
  email: boolean;       // Formal communications
  inApp: boolean;       // Platform notifications
}
```

## Trust & Safety Patterns

### Verification Badges
- **Green Shield**: Verified seller with documents
- **Blue Checkmark**: Phone verified
- **Gold Star**: Premium tier listing
- **Ghana Flag**: Local seller confirmation

### Safety Mechanisms
- **Geo-tagging Validation**: Prevents fake locations
- **Document Requirements**: Title deeds, permits
- **Duplicate Detection**: Algorithm + manual review
- **Community Reporting**: Fraud flagging system

## Search & Discovery Patterns

### Search Result Organization
```typescript
SearchResults {
  featured: Property[];        // Premium tier
  verified: Property[];        // Trust-first
  standard: Property[];        // Regular listings
  pagination: PaginationInfo;
  filters: ActiveFilters;
}
```

### Relevance Ranking
1. **Tier Level**: Premium > Standard > Basic
2. **Verification Status**: Verified > Unverified
3. **Recency**: Newer listings prioritized
4. **Engagement**: View/contact metrics
5. **Location Match**: Proximity to search area

## Mobile-First Patterns

### Touch Interactions
- **Swipe Navigation**: Image galleries
- **Touch Targets**: Minimum 44px for accessibility
- **Scroll Optimization**: Smooth scrolling, momentum
- **Gesture Support**: Pinch to zoom on maps

### Performance Patterns
- **Image Lazy Loading**: Intersection Observer
- **Progressive Enhancement**: Core features work without JS
- **Offline Resilience**: Service worker (planned)
- **3G Optimization**: Compressed images, minimal requests

## Integration Patterns

### External Services
```typescript
IntegrationPoints {
  maps: 'Mapbox' | 'Google Maps';
  payments: 'Stripe' | 'MobileMoney';
  sms: 'Twilio' | 'LocalGateway';
  currency: 'DailyFX' | 'CurrencyAPI';
  storage: 'Supabase' | 'CloudFlare';
}
```

### API Design Patterns (Planned)
- **RESTful Endpoints**: Standard CRUD operations
- **Real-time Updates**: WebSocket for notifications
- **Batch Operations**: Efficient data loading
- **Caching Strategy**: Redis for frequently accessed data

## Error Handling Patterns

### Frontend Error Boundaries
- **Route-level**: Page-specific error handling
- **Component-level**: Graceful degradation
- **Network Errors**: Retry mechanisms
- **Validation Errors**: Inline feedback

### User Feedback Patterns
- **Success States**: Toast notifications
- **Loading States**: Skeleton screens
- **Empty States**: Helpful messaging
- **Error States**: Clear recovery paths
