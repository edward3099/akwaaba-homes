'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProperties, useAdmin, useSeller, useCDN, useImageOptimization, useSecurityTesting, useAuth } from '@/lib/hooks/enhancedHooks';

export default function TestEnhancedAPIPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // API hooks
  const properties = useProperties();
  const admin = useAdmin();
  const seller = useSeller();
  const cdn = useCDN();
  const images = useImageOptimization();
  const security = useSecurityTesting();
  const auth = useAuth();

  // Test data states
  const [testPropertyData, setTestPropertyData] = useState({
    title: 'Test Property',
    description: 'A test property for API testing',
    price: 250000,
    location: 'Test Location',
    bedrooms: 3,
    bathrooms: 2,
  });

  const [testUserData, setTestUserData] = useState({
    email: 'test@example.com',
    user_type: 'seller',
    status: 'active',
  });

  const [testMessageData, setTestMessageData] = useState({
    recipientId: 'test-recipient',
    subject: 'Test Message',
    content: 'This is a test message',
    type: 'inquiry',
  });

  const [testCDNData, setTestCDNData] = useState({
    bucketName: 'property-images',
    filePath: 'test-image.jpg',
    variant: 'thumbnail',
  });

  // Test functions
  const testPropertiesAPI = useCallback(async () => {
    console.log('Testing Properties API...');
    
    // Test getting properties
    await properties.getProperties({ limit: 5 });
    
    // Test getting featured properties
    await properties.getFeaturedProperties(3);
    
    // Test searching properties
    await properties.searchProperties({ location: 'Accra', minPrice: 100000 });
  }, [properties]);

  const testAdminAPI = useCallback(async () => {
    console.log('Testing Admin API...');
    
    // Test getting users
    await admin.getUsers({ limit: 10 });
    
    // Test getting system config
    await admin.getSystemConfig();
    
    // Test getting analytics
    await admin.getAnalytics('7d', { type: 'properties' });
  }, [admin]);

  const testSellerAPI = useCallback(async () => {
    console.log('Testing Seller API...');
    
    // Test getting seller's properties
    await seller.getMyProperties({ limit: 5 });
    
    // Test getting seller's inquiries
    await seller.getMyInquiries({ status: 'pending' });
    
    // Test getting seller's analytics
    await seller.getMyAnalytics('30d', { type: 'views' });
  }, [seller]);

  const testCDNAPI = useCallback(async () => {
    console.log('Testing CDN API...');
    
    // Test getting CDN metrics
    await cdn.getMetrics('property-images', '24h');
    
    // Test optimizing CDN settings
    await cdn.optimizeSettings('property-images');
  }, [cdn]);

  const testImageOptimizationAPI = useCallback(async () => {
    console.log('Testing Image Optimization API...');
    
    // Test getting image variants
    await images.getImageVariants('property-images', 'test-image.jpg', 'thumbnail');
    
    // Test getting responsive images
    await images.getResponsiveImages('property-images', 'test-image.jpg');
  }, [images]);

  const testSecurityAPI = useCallback(async () => {
    console.log('Testing Security API...');
    
    // Test security headers
    await security.testSecurityHeaders();
    
    // Test rate limiting
    await security.testRateLimit();
    
    // Test RLS policies
    await security.testRLSPolicies();
  }, [security]);

  const testAllAPIs = useCallback(async () => {
    console.log('Testing all APIs...');
    
    await testPropertiesAPI();
    await testAdminAPI();
    await testSellerAPI();
    await testCDNAPI();
    await testImageOptimizationAPI();
    await testSecurityAPI();
  }, [testPropertiesAPI, testAdminAPI, testSellerAPI, testCDNAPI, testImageOptimizationAPI, testSecurityAPI]);

  // Render functions for different sections
  const renderOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced API Client Overview</CardTitle>
          <CardDescription>
            Comprehensive API client that integrates all backend services with React hooks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Properties API</h4>
              <p className="text-sm text-gray-600">CRUD operations for property management</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Admin API</h4>
              <p className="text-sm text-gray-600">User management and system administration</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Seller API</h4>
              <p className="text-sm text-gray-600">Seller-specific operations and analytics</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">CDN API</h4>
              <p className="text-sm text-gray-600">Content delivery and cache management</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Image Optimization</h4>
              <p className="text-sm text-gray-600">Dynamic image processing and variants</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Security Testing</h4>
              <p className="text-sm text-gray-600">Security features and vulnerability testing</p>
            </div>
          </div>
          
          <Button onClick={testAllAPIs} className="w-full">
            Test All APIs
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge variant={auth.isAuthenticated ? 'default' : 'secondary'}>
                {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Role:</span>
              <Badge variant="outline">{auth.userRole || 'None'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Admin:</span>
              <Badge variant={auth.isAdmin ? 'default' : 'secondary'}>
                {auth.isAdmin ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Seller:</span>
              <Badge variant={auth.isSeller ? 'default' : 'secondary'}>
                {auth.isSeller ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPropertiesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Properties API Testing</CardTitle>
          <CardDescription>Test property management operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={() => properties.getProperties({ limit: 5 })}>
              Get Properties
            </Button>
            <Button onClick={() => properties.getFeaturedProperties(3)}>
              Get Featured Properties
            </Button>
            <Button onClick={() => properties.searchProperties({ location: 'Accra' })}>
              Search Properties
            </Button>
            <Button onClick={testPropertiesAPI}>
              Test All Properties APIs
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-semibold">Test Property Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={testPropertyData.title}
                  onChange={(e) => setTestPropertyData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={testPropertyData.price}
                  onChange={(e) => setTestPropertyData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={testPropertyData.description}
                onChange={(e) => setTestPropertyData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => properties.createProperty(testPropertyData)}>
              Create Property
            </Button>
            <Button onClick={() => properties.updateProperty('test-id', testPropertyData)}>
              Update Property
            </Button>
            <Button onClick={() => properties.deleteProperty('test-id')}>
              Delete Property
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Loading:</span>
              <Badge variant={properties.loading ? 'default' : 'secondary'}>
                {properties.loading ? 'Yes' : 'No'}
              </Badge>
            </div>
            {properties.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <span className="text-red-700">Error: {properties.error}</span>
              </div>
            )}
            {properties.data && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <span className="text-green-700">Data received</span>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(properties.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin API Testing</CardTitle>
          <CardDescription>Test administrative operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={() => admin.getUsers({ limit: 10 })}>
              Get Users
            </Button>
            <Button onClick={() => admin.getSystemConfig()}>
              Get System Config
            </Button>
            <Button onClick={() => admin.getAnalytics('7d', { type: 'properties' })}>
              Get Analytics
            </Button>
            <Button onClick={testAdminAPI}>
              Test All Admin APIs
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-semibold">Test User Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  value={testUserData.email}
                  onChange={(e) => setTestUserData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="admin-type">User Type</Label>
                <Select value={testUserData.user_type} onValueChange={(value) => setTestUserData(prev => ({ ...prev, user_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => admin.updateUser('test-id', testUserData)}>
              Update User
            </Button>
            <Button onClick={() => admin.bulkUserActions([{ action: 'activate', userIds: ['test-1', 'test-2'] }])}>
              Bulk Actions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin API Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Loading:</span>
              <Badge variant={admin.loading ? 'default' : 'secondary'}>
                {admin.loading ? 'Yes' : 'No'}
              </Badge>
            </div>
            {admin.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <span className="text-red-700">Error: {admin.error}</span>
              </div>
            )}
            {admin.data && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <span className="text-green-700">Data received</span>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(admin.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSellerTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seller API Testing</CardTitle>
          <CardDescription>Test seller-specific operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={() => seller.getMyProperties({ limit: 5 })}>
              Get My Properties
            </Button>
            <Button onClick={() => seller.getMyInquiries({ status: 'pending' })}>
              Get My Inquiries
            </Button>
            <Button onClick={() => seller.getMyAnalytics('30d', { type: 'views' })}>
              Get My Analytics
            </Button>
            <Button onClick={testSellerAPI}>
              Test All Seller APIs
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-semibold">Test Message Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="message-subject">Subject</Label>
                <Input
                  id="message-subject"
                  value={testMessageData.subject}
                  onChange={(e) => setTestMessageData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="message-type">Type</Label>
                <Select value={testMessageData.type} onValueChange={(value) => setTestMessageData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inquiry">Inquiry</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="message-content">Content</Label>
              <Textarea
                id="message-content"
                value={testMessageData.content}
                onChange={(e) => setTestMessageData(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => seller.sendMessage(testMessageData)}>
              Send Message
            </Button>
            <Button onClick={() => seller.sendBulkMessage({ messages: [testMessageData, { ...testMessageData, subject: 'Bulk Test' }] })}>
              Send Bulk Message
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seller API Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Loading:</span>
              <Badge variant={seller.loading ? 'default' : 'secondary'}>
                {seller.loading ? 'Yes' : 'No'}
              </Badge>
            </div>
            {seller.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <span className="text-red-700">Error: {seller.error}</span>
              </div>
            )}
            {seller.data && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <span className="text-green-700">Data received</span>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(seller.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCDNTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CDN API Testing</CardTitle>
          <CardDescription>Test content delivery and cache management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={() => cdn.getMetrics('property-images', '24h')}>
              Get CDN Metrics
            </Button>
            <Button onClick={() => cdn.optimizeSettings('property-images')}>
              Optimize CDN Settings
            </Button>
            <Button onClick={testCDNAPI}>
              Test All CDN APIs
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-semibold">Test CDN Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cdn-bucket">Bucket Name</Label>
                <Input
                  id="cdn-bucket"
                  value={testCDNData.bucketName}
                  onChange={(e) => setTestCDNData(prev => ({ ...prev, bucketName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="cdn-file">File Path</Label>
                <Input
                  id="cdn-file"
                  value={testCDNData.filePath}
                  onChange={(e) => setTestCDNData(prev => ({ ...prev, filePath: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => cdn.uploadFile({ bucket: testCDNData.bucketName, file: testCDNData.filePath })}>
              Upload File
            </Button>
            <Button onClick={() => cdn.preloadAssets([{ bucket: testCDNData.bucketName, path: testCDNData.filePath }])}>
              Preload Assets
            </Button>
            <Button onClick={() => cdn.warmUpCache({ bucket: testCDNData.bucketName, paths: [testCDNData.filePath] })}>
              Warm Up Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CDN API Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Loading:</span>
              <Badge variant={cdn.loading ? 'default' : 'secondary'}>
                {cdn.loading ? 'Yes' : 'No'}
              </Badge>
            </div>
            {cdn.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <span className="text-red-700">Error: {cdn.error}</span>
              </div>
            )}
            {cdn.data && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <span className="text-green-700">Data received</span>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(cdn.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderImagesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Optimization API Testing</CardTitle>
          <CardDescription>Test dynamic image processing and variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={() => images.getImageVariants('property-images', 'test-image.jpg', 'thumbnail')}>
              Get Image Variants
            </Button>
            <Button onClick={() => images.getResponsiveImages('property-images', 'test-image.jpg')}>
              Get Responsive Images
            </Button>
            <Button onClick={testImageOptimizationAPI}>
              Test All Image APIs
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-semibold">Test Image Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image-variant">Variant</Label>
                <Select value={testCDNData.variant} onValueChange={(value) => setTestCDNData(prev => ({ ...prev, variant: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thumbnail">Thumbnail</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="original">Original</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => images.optimizeImage({ bucket: testCDNData.bucketName, path: testCDNData.filePath, variant: testCDNData.variant })}>
              Optimize Image
            </Button>
            <Button onClick={() => images.getOptimizedImage({ bucket: testCDNData.bucketName, path: testCDNData.filePath, variant: testCDNData.variant })}>
              Get Optimized Image
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image API Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Loading:</span>
              <Badge variant={images.loading ? 'default' : 'secondary'}>
                {images.loading ? 'Yes' : 'No'}
              </Badge>
            </div>
            {images.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <span className="text-red-700">Error: {images.error}</span>
              </div>
            )}
            {images.data && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <span className="text-green-700">Data received</span>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(images.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security API Testing</CardTitle>
          <CardDescription>Test security features and vulnerability testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={() => security.testSecurityHeaders()}>
              Test Security Headers
            </Button>
            <Button onClick={() => security.testRateLimit()}>
              Test Rate Limiting
            </Button>
            <Button onClick={() => security.testRLSPolicies()}>
              Test RLS Policies
            </Button>
            <Button onClick={testSecurityAPI}>
              Test All Security APIs
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-semibold">Test Security Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="security-input">Test Input</Label>
                <Input
                  id="security-input"
                  placeholder="Enter test input for validation"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => security.testInputValidation({ input: 'test-input', type: 'string' })}>
              Test Input Validation
            </Button>
            <Button onClick={() => security.testSQLInjection({ query: 'SELECT * FROM users WHERE id = 1' })}>
              Test SQL Injection
            </Button>
            <Button onClick={() => security.testXSSProtection({ input: '<script>alert("xss")</script>' })}>
              Test XSS Protection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security API Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Loading:</span>
              <Badge variant={security.loading ? 'default' : 'secondary'}>
                {security.loading ? 'Yes' : 'No'}
              </Badge>
            </div>
            {security.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <span className="text-red-700">Error: {security.error}</span>
              </div>
            )}
            {security.data && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <span className="text-green-700">Data received</span>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(security.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Enhanced API Client Testing</h1>
        <p className="text-gray-600">
          Comprehensive testing interface for all enhanced API client functionality
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="seller">Seller</TabsTrigger>
          <TabsTrigger value="cdn">CDN</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          {renderPropertiesTab()}
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          {renderAdminTab()}
        </TabsContent>

        <TabsContent value="seller" className="space-y-6">
          {renderSellerTab()}
        </TabsContent>

        <TabsContent value="cdn" className="space-y-6">
          {renderCDNTab()}
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          {renderImagesTab()}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {renderSecurityTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}


















