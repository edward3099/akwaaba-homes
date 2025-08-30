# Enhanced API Client Integration Guide

This guide provides comprehensive documentation for integrating the Enhanced API Client with your React components in the AkwaabaHomes application.

## Overview

The Enhanced API Client provides a unified interface for all backend services, including:
- **Properties Management** - CRUD operations for real estate properties
- **Admin Operations** - User management and system administration
- **Seller Operations** - Seller-specific functionality and analytics
- **CDN Management** - Content delivery and cache optimization
- **Image Optimization** - Dynamic image processing and variants
- **Security Testing** - Security features and vulnerability testing

## Quick Start

### 1. Import the Enhanced API Client

```typescript
import { enhancedApiClient } from '@/lib/api/enhancedApiClient';

// Or import individual clients
import { propertiesApi, adminApi, sellerApi, cdnApi, imagesApi, securityApi } from '@/lib/api/enhancedApiClient';
```

### 2. Use React Hooks for State Management

```typescript
import { useProperties, useAdmin, useSeller, useCDN, useImageOptimization, useSecurityTesting } from '@/lib/hooks/enhancedHooks';

function MyComponent() {
  const properties = useProperties();
  const admin = useAdmin();
  
  // Use the hooks...
}
```

## API Client Classes

### BaseApiClient

All API clients extend from `BaseApiClient` which provides:
- Common request handling
- Authentication management
- Error handling
- Response formatting

### PropertiesApiClient

```typescript
// Get all properties with filters
const response = await enhancedApiClient.properties.getProperties({
  limit: 10,
  location: 'Accra',
  minPrice: 100000
});

// Get property by ID
const property = await enhancedApiClient.properties.getPropertyById('property-123');

// Create new property (requires authentication)
const newProperty = await enhancedApiClient.properties.createProperty({
  title: 'Modern Apartment',
  price: 250000,
  location: 'East Legon',
  bedrooms: 3,
  bathrooms: 2
});

// Update property
const updated = await enhancedApiClient.properties.updateProperty('property-123', {
  price: 275000
});

// Delete property
await enhancedApiClient.properties.deleteProperty('property-123');

// Search properties
const searchResults = await enhancedApiClient.properties.searchProperties({
  location: 'Accra',
  minPrice: 100000,
  maxPrice: 500000,
  bedrooms: 3
});

// Get featured properties
const featured = await enhancedApiClient.properties.getFeaturedProperties(6);
```

### AdminApiClient

```typescript
// Get users with filters
const users = await enhancedApiClient.admin.getUsers({
  limit: 20,
  user_type: 'seller',
  status: 'active'
});

// Get user by ID
const user = await enhancedApiClient.admin.getUserById('user-123');

// Update user
await enhancedApiClient.admin.updateUser('user-123', {
  status: 'suspended',
  user_type: 'buyer'
});

// Bulk user actions
await enhancedApiClient.admin.bulkUserActions([
  { action: 'activate', userIds: ['user-1', 'user-2'] },
  { action: 'suspend', userIds: ['user-3'] }
]);

// Get properties for approval
const pendingProperties = await enhancedApiClient.admin.getPropertiesForApproval({
  status: 'pending',
  limit: 50
});

// Approve property
await enhancedApiClient.admin.approveProperty('property-123', {
  approved: true,
  notes: 'Property meets all requirements',
  approvedBy: 'admin-456'
});

// Bulk property approval
await enhancedApiClient.admin.bulkPropertyApproval([
  { propertyId: 'property-1', approved: true, notes: 'Approved' },
  { propertyId: 'property-2', approved: false, notes: 'Needs more photos' }
]);

// Get analytics
const analytics = await enhancedApiClient.admin.getAnalytics('30d', {
  type: 'properties',
  groupBy: 'location'
});

// Get system configuration
const config = await enhancedApiClient.admin.getSystemConfig();

// Update system configuration
await enhancedApiClient.admin.updateSystemConfig({
  maxFileSize: '10MB',
  allowedFileTypes: ['jpg', 'png', 'pdf'],
  maintenanceMode: false
});
```

### SellerApiClient

```typescript
// Get seller's properties
const myProperties = await enhancedApiClient.seller.getMyProperties({
  limit: 20,
  status: 'active'
});

// Get specific property
const property = await enhancedApiClient.seller.getMyPropertyById('property-123');

// Create property
const newProperty = await enhancedApiClient.seller.createMyProperty({
  title: 'My New Property',
  price: 300000,
  location: 'West Legon'
});

// Update property
await enhancedApiClient.seller.updateMyProperty('property-123', {
  price: 325000,
  description: 'Updated description'
});

// Delete property
await enhancedApiClient.seller.deleteMyProperty('property-123');

// Get inquiries
const inquiries = await enhancedApiClient.seller.getMyInquiries({
  status: 'pending',
  limit: 10
});

// Update inquiry
await enhancedApiClient.seller.updateInquiry('inquiry-123', {
  status: 'responded',
  notes: 'Customer contacted'
});

// Get analytics
const analytics = await enhancedApiClient.seller.getMyAnalytics('7d', {
  type: 'views',
  groupBy: 'property'
});

// Send message
await enhancedApiClient.seller.sendMessage({
  recipientId: 'buyer-123',
  subject: 'Property Inquiry Response',
  content: 'Thank you for your interest...',
  type: 'inquiry'
});

// Send bulk messages
await enhancedApiClient.seller.sendBulkMessage({
  messages: [
    {
      recipientId: 'buyer-1',
      subject: 'Property Update',
      content: 'Your property has been updated'
    },
    {
      recipientId: 'buyer-2',
      subject: 'New Photos Available',
      content: 'Check out the new photos'
    }
  ]
});
```

### CDNApiClient

```typescript
// Upload file
const upload = await enhancedApiClient.cdn.uploadFile({
  bucket: 'property-images',
  file: fileData,
  path: 'properties/property-123/main.jpg',
  metadata: {
    contentType: 'image/jpeg',
    size: fileData.size
  }
});

// Preload assets
await enhancedApiClient.cdn.preloadAssets([
  { bucket: 'property-images', path: 'properties/property-123/main.jpg' },
  { bucket: 'property-images', path: 'properties/property-123/thumbnail.jpg' }
]);

// Warm up cache
await enhancedApiClient.cdn.warmUpCache({
  bucket: 'property-images',
  paths: [
    'properties/property-123/main.jpg',
    'properties/property-123/gallery/1.jpg'
  ]
});

// Get metrics
const metrics = await enhancedApiClient.cdn.getMetrics('property-images', '24h');

// Optimize settings
await enhancedApiClient.cdn.optimizeSettings('property-images');
```

### ImageOptimizationApiClient

```typescript
// Optimize image
const optimized = await enhancedApiClient.images.optimizeImage({
  bucket: 'property-images',
  path: 'properties/property-123/main.jpg',
  variant: 'thumbnail',
  quality: 80,
  width: 300,
  height: 200
});

// Get optimized image
const image = await enhancedApiClient.images.getOptimizedImage({
  bucket: 'property-images',
  path: 'properties/property-123/main.jpg',
  variant: 'medium',
  quality: 85
});

// Get image variants
const variants = await enhancedApiClient.images.getImageVariants(
  'property-images',
  'properties/property-123/main.jpg',
  'thumbnail'
);

// Get responsive images
const responsive = await enhancedApiClient.images.getResponsiveImages(
  'property-images',
  'properties/property-123/main.jpg'
);
```

### SecurityTestingApiClient

```typescript
// Test security headers
const headers = await enhancedApiClient.security.testSecurityHeaders();

// Test rate limiting
const rateLimit = await enhancedApiClient.security.testRateLimit();

// Test input validation
const validation = await enhancedApiClient.security.testInputValidation({
  input: 'test-input',
  type: 'string',
  rules: ['required', 'minLength:3']
});

// Test RLS policies
const rls = await enhancedApiClient.security.testRLSPolicies();

// Test SQL injection protection
const sqlInjection = await enhancedApiClient.security.testSQLInjection({
  query: 'SELECT * FROM users WHERE id = 1'
});

// Test XSS protection
const xss = await enhancedApiClient.security.testXSSProtection({
  input: '<script>alert("xss")</script>'
});
```

## React Hooks Usage

### useProperties Hook

```typescript
import { useProperties } from '@/lib/hooks/enhancedHooks';

function PropertiesList() {
  const properties = useProperties();
  
  useEffect(() => {
    // Load properties on component mount
    properties.getProperties({ limit: 10 });
  }, []);
  
  const handleCreateProperty = async (propertyData) => {
    const result = await properties.createProperty(propertyData);
    if (result.success) {
      // Refresh the list
      properties.getProperties({ limit: 10 });
    }
  };
  
  if (properties.loading) return <div>Loading...</div>;
  if (properties.error) return <div>Error: {properties.error}</div>;
  
  return (
    <div>
      {properties.data?.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

### useAdmin Hook

```typescript
import { useAdmin } from '@/lib/hooks/enhancedHooks';

function AdminDashboard() {
  const admin = useAdmin();
  
  useEffect(() => {
    // Load admin data
    admin.getUsers({ limit: 20 });
    admin.getAnalytics('7d', { type: 'properties' });
  }, []);
  
  const handleBulkAction = async (action, userIds) => {
    const result = await admin.bulkUserActions([
      { action, userIds }
    ]);
    
    if (result.success) {
      // Refresh data
      admin.getUsers({ limit: 20 });
    }
  };
  
  return (
    <div>
      {/* Admin dashboard content */}
    </div>
  );
}
```

### useSeller Hook

```typescript
import { useSeller } from '@/lib/hooks/enhancedHooks';

function SellerDashboard() {
  const seller = useSeller();
  
  useEffect(() => {
    // Load seller data
    seller.getMyProperties({ limit: 10 });
    seller.getMyAnalytics('30d', { type: 'views' });
  }, []);
  
  const handleSendMessage = async (messageData) => {
    const result = await seller.sendMessage(messageData);
    if (result.success) {
      // Show success message
      console.log('Message sent successfully');
    }
  };
  
  return (
    <div>
      {/* Seller dashboard content */}
    </div>
  );
}
```

### useCDN Hook

```typescript
import { useCDN } from '@/lib/hooks/enhancedHooks';

function CDNManager() {
  const cdn = useCDN();
  
  const handleUpload = async (file) => {
    const result = await cdn.uploadFile({
      bucket: 'property-images',
      file,
      path: `properties/${Date.now()}/${file.name}`
    });
    
    if (result.success) {
      console.log('File uploaded successfully');
    }
  };
  
  const handleOptimize = async (bucketName) => {
    await cdn.optimizeSettings(bucketName);
  };
  
  return (
    <div>
      {/* CDN management interface */}
    </div>
  );
}
```

### useImageOptimization Hook

```typescript
import { useImageOptimization } from '@/lib/hooks/enhancedHooks';

function ImageOptimizer() {
  const images = useImageOptimization();
  
  const handleOptimize = async (imageData) => {
    const result = await images.optimizeImage({
      bucket: 'property-images',
      path: 'test-image.jpg',
      variant: 'thumbnail',
      quality: 80
    });
    
    if (result.success) {
      console.log('Image optimized successfully');
    }
  };
  
  return (
    <div>
      {/* Image optimization interface */}
    </div>
  );
}
```

### useSecurityTesting Hook

```typescript
import { useSecurityTesting } from '@/lib/hooks/enhancedHooks';

function SecurityTester() {
  const security = useSecurityTesting();
  
  const runSecurityTests = async () => {
    // Test all security features
    await security.testSecurityHeaders();
    await security.testRateLimit();
    await security.testRLSPolicies();
    await security.testInputValidation({ input: 'test', type: 'string' });
  };
  
  return (
    <div>
      <button onClick={runSecurityTests}>
        Run Security Tests
      </button>
      
      {security.loading && <div>Running tests...</div>}
      {security.error && <div>Error: {security.error}</div>}
      {security.data && <div>Tests completed</div>}
    </div>
  );
}
```

### useAuth Hook

```typescript
import { useAuth } from '@/lib/hooks/enhancedHooks';

function AuthGuard({ children, requiredRole }) {
  const auth = useAuth();
  
  if (auth.loading) {
    return <div>Loading authentication...</div>;
  }
  
  if (!auth.isAuthenticated) {
    return <div>Please log in to continue</div>;
  }
  
  if (requiredRole && !auth.hasRole(requiredRole)) {
    return <div>Access denied. Required role: {requiredRole}</div>;
  }
  
  return children;
}

// Usage
function AdminOnlyComponent() {
  return (
    <AuthGuard requiredRole="admin">
      <div>Admin only content</div>
    </AuthGuard>
  );
}
```

### useMultipleApiCalls Hook

```typescript
import { useMultipleApiCalls } from '@/lib/hooks/enhancedHooks';

function Dashboard() {
  const { executeCall, getCallState, resetAllCalls } = useMultipleApiCalls();
  
  useEffect(() => {
    // Execute multiple API calls
    executeCall('users', () => enhancedApiClient.admin.getUsers({ limit: 10 }));
    executeCall('properties', () => enhancedApiClient.properties.getProperties({ limit: 5 }));
    executeCall('analytics', () => enhancedApiClient.admin.getAnalytics('7d'));
  }, []);
  
  const usersState = getCallState('users');
  const propertiesState = getCallState('properties');
  const analyticsState = getCallState('analytics');
  
  const handleRefresh = () => {
    resetAllCalls();
    // Re-execute calls...
  };
  
  return (
    <div>
      <div>
        Users: {usersState.loading ? 'Loading...' : usersState.data ? 'Loaded' : 'Not loaded'}
      </div>
      <div>
        Properties: {propertiesState.loading ? 'Loading...' : propertiesState.data ? 'Loaded' : 'Not loaded'}
      </div>
      <div>
        Analytics: {analyticsState.loading ? 'Loading...' : analyticsState.data ? 'Loaded' : 'Not loaded'}
      </div>
      
      <button onClick={handleRefresh}>Refresh All</button>
    </div>
  );
}
```

## Error Handling

The Enhanced API Client provides comprehensive error handling:

```typescript
// All API calls return ApiResponse with consistent structure
const response = await enhancedApiClient.properties.getProperties();

if (response.success) {
  // Handle success
  console.log('Data:', response.data);
  console.log('Message:', response.message);
} else {
  // Handle error
  console.error('Error:', response.error);
  console.error('Message:', response.message);
}

// React hooks automatically handle errors and show toasts
const properties = useProperties();
// Errors are automatically displayed via toast notifications
// You can also access error state: properties.error
```

## Authentication

The Enhanced API Client automatically handles authentication:

```typescript
// Check if user is authenticated
const isAuth = await enhancedApiClient.isAuthenticated();

// Get current user
const user = await enhancedApiClient.getCurrentUser();

// Get user role
const role = await enhancedApiClient.getUserRole();

// Check specific roles
const isAdmin = await enhancedApiClient.isAdmin();
const isSeller = await enhancedApiClient.isSeller();

// Use the useAuth hook for React components
const auth = useAuth();
if (auth.isAuthenticated && auth.isAdmin) {
  // Show admin content
}
```

## Best Practices

### 1. Use React Hooks for State Management

```typescript
// ✅ Good: Use hooks for automatic state management
const properties = useProperties();
await properties.getProperties();

// ❌ Avoid: Direct API client usage without state management
const response = await enhancedApiClient.properties.getProperties();
// You'll need to manage loading, error, and data states manually
```

### 2. Handle Loading and Error States

```typescript
function MyComponent() {
  const api = useProperties();
  
  if (api.loading) return <LoadingSpinner />;
  if (api.error) return <ErrorMessage error={api.error} />;
  
  return <DataDisplay data={api.data} />;
}
```

### 3. Use Appropriate Error Messages

```typescript
const response = await api.createProperty(propertyData);
if (!response.success) {
  // Use the error message from the API response
  console.error(response.error);
  // Or provide a user-friendly message
  showToast('Failed to create property. Please try again.');
}
```

### 4. Implement Proper Cleanup

```typescript
useEffect(() => {
  const loadData = async () => {
    await api.getData();
  };
  
  loadData();
  
  // Cleanup function
  return () => {
    api.reset(); // Reset the hook state
  };
}, []);
```

### 5. Use TypeScript for Better Type Safety

```typescript
// Define your data types
interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
}

// Use with hooks
const properties = useProperties<Property[]>();
```

## Testing

Use the provided test page to verify all API functionality:

```typescript
// Navigate to /test-enhanced-api
// This page provides comprehensive testing for all API endpoints
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure user is logged in
   - Check if the required role is assigned
   - Verify Supabase session is valid

2. **API Endpoint Not Found**
   - Verify the API route exists
   - Check the endpoint path in the client
   - Ensure the backend server is running

3. **TypeScript Errors**
   - Use proper type annotations
   - Import types from the correct modules
   - Check for missing dependencies

4. **Build Errors**
   - Run `npm run build` to check for compilation issues
   - Fix any TypeScript errors before deployment

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
TASKMASTER_LOG_LEVEL=debug
```

This will provide detailed logging for all API calls and responses.

## Migration from Legacy API Client

If you're migrating from the legacy API client:

1. **Replace imports**
   ```typescript
   // Old
   import { apiClient } from '@/lib/api/apiClient';
   
   // New
   import { enhancedApiClient } from '@/lib/api/enhancedApiClient';
   ```

2. **Update method calls**
   ```typescript
   // Old
   const response = await apiClient.getProperties();
   
   // New
   const response = await enhancedApiClient.properties.getProperties();
   ```

3. **Use React hooks**
   ```typescript
   // Old: Manual state management
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(false);
   
   // New: Automatic state management
   const properties = useProperties();
   ```

## Conclusion

The Enhanced API Client provides a robust, type-safe, and developer-friendly interface for all backend services. By using the provided React hooks, you can build applications with minimal boilerplate code while maintaining excellent user experience through automatic loading states, error handling, and toast notifications.

For additional support or questions, refer to the test page at `/test-enhanced-api` or check the source code in `src/lib/api/enhancedApiClient.ts` and `src/lib/hooks/enhancedHooks.ts`.





















