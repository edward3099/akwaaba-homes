# Technical Context - AkwaabaHomes

## Current Technology Stack

### Frontend (Implemented)
- **Framework**: Next.js 15.4.7 with App Router
- **Language**: TypeScript for type safety
- **Styling**: TailwindCSS v4 with custom Ghana-inspired design system
- **UI Components**: ShadCN UI with Radix primitives
- **Icons**: Lucide React for consistent iconography
- **Animations**: Framer Motion + tw-animate-css
- **State Management**: Zustand (installed, not yet implemented)
- **Forms**: React Hook Form + Zod validation (installed, not yet implemented)

### Planned Backend Stack
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with phone verification
- **File Storage**: Supabase Storage for images/videos
- **Maps**: Mapbox for cost-effective mapping (vs Google Maps)
- **Payments**: Stripe + Mobile Money (MTN, Vodafone, AirtelTigo)
- **SMS/OTP**: Supabase + Twilio/local gateway
- **Currency API**: Daily FX API via Supabase Edge Functions

## Architecture Decisions

### Frontend Architecture
- **Component Structure**: Modular components organized by feature
- **Routing**: File-based routing with dynamic segments for properties
- **Styling Approach**: Utility-first with custom design tokens
- **Type Safety**: Comprehensive TypeScript interfaces for all entities
- **Responsive Design**: Mobile-first approach for Ghana's mobile-heavy market

### Design System
- **Color Palette**: Ghana flag colors (red, gold, green) with modern variations
- **Typography**: Inter (primary) + Poppins (headings) for readability
- **Component Library**: ShadCN UI for consistent, accessible components
- **Custom Utilities**: Ghana-specific styles and property-related classes

### Key Technical Patterns

#### Multi-Currency Implementation
```typescript
// All properties stored in GHS
// Real-time conversion for display
export interface Property {
  price: number; // Always in GHS
  currency: 'GHS'; // Enforced at type level
}

// Display conversion
export function formatDiasporaPrice(price: number, targetCurrency: CurrencyCode)
```

#### Property Type System
- Comprehensive TypeScript interfaces for all entities
- Strict validation of property data structure
- Mandatory geo-tagging at type level
- Clear separation of seller types and verification status

#### Component Organization
```
src/
├── components/
│   ├── layout/        # Header, Footer, Navigation
│   ├── sections/      # Homepage sections
│   ├── property/      # Property-related components
│   ├── search/        # Search and filtering
│   ├── filters/       # Advanced filtering
│   └── ui/           # ShadCN base components
├── app/              # Next.js App Router pages
├── lib/
│   ├── types/        # TypeScript definitions
│   ├── utils/        # Utility functions
│   ├── hooks/        # Custom React hooks
│   └── stores/       # Zustand state stores
```

## Development Setup

### Environment
- **Node.js**: Latest LTS with npm
- **Package Manager**: npm (package-lock.json tracked)
- **Development Server**: Next.js with Turbopack (--turbopack flag)
- **Code Quality**: ESLint + TypeScript strict mode

### Configuration Files
- **tailwind.config.ts**: Custom theme configuration
- **next.config.ts**: Image domains and build optimization
- **tsconfig.json**: TypeScript compiler options
- **components.json**: ShadCN UI configuration

### Current External Integrations
- **Google Fonts**: Inter and Poppins via CDN
- **Unsplash Images**: Configured in next.config.ts for development
- **Future**: Mapbox, Supabase, payment providers

## Performance Considerations

### Image Optimization
- Next.js Image component with responsive loading
- Remote pattern configuration for external image sources
- Lazy loading and placeholder strategies

### Bundle Optimization
- Tree-shaking enabled via ES modules
- Dynamic imports for heavy components
- Turbopack for faster development builds

### Mobile Performance
- Mobile-first responsive design
- Touch-friendly interactions
- Optimized for Ghana's 3G networks (target <3s load time)

## Security Considerations

### Frontend Security
- Input validation via Zod schemas
- XSS protection through React's built-in escaping
- Secure external link handling
- Image domain restrictions

### Planned Backend Security
- Row-level security with Supabase
- Phone number verification for sellers
- Document verification workflow
- Rate limiting for API endpoints

## Development Workflow

### Current Status
- **Phase**: Frontend development and demo
- **Completed**: Homepage, search/listings, property details, core components
- **In Progress**: Responsive optimization, seller dashboard
- **Next**: Backend integration with Supabase

### Quality Assurance
- TypeScript for compile-time error checking
- ESLint for code quality
- Responsive testing across device sizes
- Component-based development for maintainability

### Deployment Strategy (Planned)
- **Frontend**: Vercel (Next.js optimized)
- **Backend**: Supabase cloud
- **CDN**: Vercel Edge Network
- **Domain**: Ghana-specific domain (.com.gh consideration)
