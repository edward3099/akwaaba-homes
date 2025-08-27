'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { propertyService } from '@/lib/services/propertyService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Home, Search, Star, Image } from 'lucide-react';

export default function TestAPIsPage() {
  const { user, isAgent, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Test form state
  const [testProperty, setTestProperty] = useState({
    title: 'Test Property',
    description: 'This is a test property for API testing',
    price: 250000,
    currency: 'GHS',
    property_type: 'house' as const,
    listing_type: 'sale' as const,
    address: '123 Test Street',
    city: 'Accra',
    region: 'Greater Accra',
    postal_code: '00233',
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1500,
    features: ['Garden', 'Parking'],
    amenities: ['Garden', 'Parking', 'Security'],
    status: 'active' as const,
    is_featured: false,
    views_count: 0,
  });

  const [searchQuery, setSearchQuery] = useState({
    query: 'house',
    property_type: 'house' as const,
    min_price: 100000,
    max_price: 500000,
    city: 'Accra',
  });

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsLoading(true);
    setErrors([]);
    
    try {
      const result = await testFunction();
      setResults(prev => ({ ...prev, [testName]: result }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setErrors(prev => [...prev, `${testName}: ${errorMessage}`]);
      setResults(prev => ({ ...prev, [testName]: { error: errorMessage } }));
    } finally {
      setIsLoading(false);
    }
  };

  // Test functions
  const testGetProperties = () => propertyService.getProperties({ limit: 5 });
  const testGetFeaturedProperties = () => propertyService.getFeaturedProperties(3);
  const testSearchProperties = () => propertyService.searchProperties(searchQuery);
  
  const testCreateProperty = async () => {
    if (!isAgent && !isAdmin) {
      throw new Error('Only sellers and agents can create properties');
    }
    return propertyService.createProperty(testProperty);
  };

  const testUpdateProperty = async () => {
    if (!results['Create Property']?.property?.id) {
      throw new Error('Create a property first');
    }
    const propertyId = results['Create Property'].property.id;
    return propertyService.updateProperty(propertyId, { price: 275000 });
  };

  const testDeleteProperty = async () => {
    if (!results['Create Property']?.property?.id) {
      throw new Error('Create a property first');
    }
    const propertyId = results['Create Property'].property.id;
    return propertyService.deleteProperty(propertyId);
  };

  const testPropertyImages = async () => {
    if (!results['Create Property']?.property?.id) {
      throw new Error('Create a property first');
    }
    const propertyId = results['Create Property'].property.id;
    
    // Upload image
    const uploadResult = await propertyService.uploadPropertyImage(propertyId, {
      image_url: 'https://example.com/test-image.jpg',
      caption: 'Test property image',
      is_primary: true,
    });

    // Get images
    const imagesResult = await propertyService.getPropertyImages(propertyId);

    return { upload: uploadResult, images: imagesResult };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Management APIs Test</h1>
          <p className="text-gray-600">Test all the new property management APIs</p>
        </div>

        {/* Authentication Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>User ID</Label>
                <Input value={user?.id || 'Not authenticated'} readOnly />
              </div>
              <div>
                <Label>User Type</Label>
                <Input value={isAgent ? 'Agent' : isAdmin ? 'Admin' : 'Unknown'} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || 'Not authenticated'} readOnly />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input value={user?.user_metadata?.full_name || 'Unknown'} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Property Creation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Test Property Data
              </CardTitle>
              <CardDescription>Configure the test property for creation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={testProperty.title}
                  onChange={(e) => setTestProperty(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={testProperty.price}
                  onChange={(e) => setTestProperty(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Property Type</Label>
                <Select
                  value={testProperty.property_type}
                  onValueChange={(value: any) => setTestProperty(prev => ({ ...prev, property_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={testProperty.city}
                  onChange={(e) => setTestProperty(prev => ({ 
                    ...prev, 
                    city: e.target.value 
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Search Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-green-600" />
                Search Configuration
              </CardTitle>
              <CardDescription>Configure search parameters for testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Search Query</Label>
                <Input
                  value={searchQuery.query}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, query: e.target.value }))}
                />
              </div>
              <div>
                <Label>Min Price</Label>
                <Input
                  type="number"
                  value={searchQuery.min_price}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, min_price: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Max Price</Label>
                <Input
                  type="number"
                  value={searchQuery.max_price}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, max_price: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={searchQuery.city}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <Tabs defaultValue="read" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="read">Read APIs</TabsTrigger>
            <TabsTrigger value="write">Write APIs</TabsTrigger>
            <TabsTrigger value="search">Search APIs</TabsTrigger>
            <TabsTrigger value="images">Image APIs</TabsTrigger>
          </TabsList>

          {/* Read APIs */}
          <TabsContent value="read" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => runTest('Get Properties', testGetProperties)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Home className="mr-2 h-4 w-4" />}
                Test Get Properties
              </Button>
              
              <Button
                onClick={() => runTest('Get Featured Properties', testGetFeaturedProperties)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Star className="mr-2 h-4 w-4" />}
                Test Featured Properties
              </Button>
            </div>
          </TabsContent>

          {/* Write APIs */}
          <TabsContent value="write" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => runTest('Create Property', testCreateProperty)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Home className="mr-2 h-4 w-4" />}
                Create Property
              </Button>
              
              <Button
                onClick={() => runTest('Update Property', testUpdateProperty)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Home className="mr-2 h-4 w-4" />}
                Update Property
              </Button>
              
              <Button
                onClick={() => runTest('Delete Property', testDeleteProperty)}
                disabled={isLoading}
                className="w-full"
                variant="destructive"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Home className="mr-2 h-4 w-4" />}
                Delete Property
              </Button>
            </div>
          </TabsContent>

          {/* Search APIs */}
          <TabsContent value="search" className="space-y-4">
            <Button
              onClick={() => runTest('Search Properties', testSearchProperties)}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Test Search Properties
            </Button>
          </TabsContent>

          {/* Image APIs */}
          <TabsContent value="images" className="space-y-4">
            <Button
              onClick={() => runTest('Property Images', testPropertyImages)}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Image className="mr-2 h-4 w-4" />}
              Test Property Images
            </Button>
          </TabsContent>
        </Tabs>

        {/* Results Display */}
        <div className="mt-8 space-y-6">
          {/* Errors */}
          {errors.length > 0 && (
            <Alert className="border-red-500">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {Object.keys(results).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Results from API tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(results).map(([testName, result]) => (
                    <div key={testName} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">{testName}</h3>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
