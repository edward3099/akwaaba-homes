'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface StorageTestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export default function TestStorageSystemPage() {
  const [results, setResults] = useState<Record<string, StorageTestResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const addResult = (testName: string, result: StorageTestResult) => {
    setResults(prev => ({
      ...prev,
      [testName]: result
    }));
  };

  const setLoadingState = (testName: string, isLoading: boolean) => {
    setLoading(prev => ({
      ...prev,
      [testName]: isLoading
    }));
  };

  // Test CDN Management
  const testCDNManagement = async (action: string) => {
    const testName = `cdn-${action}`;
    setLoadingState(testName, true);
    
    try {
      const response = await fetch('/api/cdn/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          bucketName: 'property-images',
          filePath: '/test-image.jpg',
          contentType: 'image/jpeg',
          isPublic: true,
          customCacheControl: 'public, max-age=86400'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addResult(testName, {
          success: true,
          data,
          timestamp: new Date().toISOString()
        });
      } else {
        addResult(testName, {
          success: false,
          error: data.error || 'Request failed',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      addResult(testName, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoadingState(testName, false);
    }
  };

  // Test Image Optimization
  const testImageOptimization = async (variant?: string) => {
    const testName = `image-optimization-${variant || 'custom'}`;
    setLoadingState(testName, true);
    
    try {
      const response = await fetch('/api/images/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucketName: 'property-images',
          imagePath: '/test-property/main-image.jpg',
          variant,
          width: variant ? undefined : 800,
          height: variant ? undefined : 600,
          quality: 85,
          format: 'webp',
          resize: 'cover'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addResult(testName, {
          success: true,
          data,
          timestamp: new Date().toISOString()
        });
      } else {
        addResult(testName, {
          success: false,
          error: data.error || 'Request failed',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      addResult(testName, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoadingState(testName, false);
    }
  };

  // Test Storage Bucket Info
  const testStorageBucketInfo = async () => {
    const testName = 'storage-bucket-info';
    setLoadingState(testName, true);
    
    try {
      // This would typically call a storage service
      // For now, we'll simulate the response
      const mockData = {
        buckets: [
          {
            id: 'property-images',
            name: 'property-images',
            public: true,
            file_size_limit: 10485760,
            allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
          },
          {
            id: 'property-documents',
            name: 'property-documents',
            public: false,
            file_size_limit: 52428800,
            allowed_mime_types: ['application/pdf', 'application/msword']
          }
        ]
      };
      
      addResult(testName, {
        success: true,
        data: mockData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      addResult(testName, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoadingState(testName, false);
    }
  };

  // Test File Upload Simulation
  const testFileUpload = async () => {
    const testName = 'file-upload';
    setLoadingState(testName, true);
    
    try {
      // Simulate file upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        file_id: 'test-file-123',
        bucket_name: 'property-images',
        file_path: '/user-123/property-456/main-image.jpg',
        file_size: 2048576,
        content_type: 'image/jpeg',
        public_url: 'https://example.com/storage/property-images/user-123/property-456/main-image.jpg'
      };
      
      addResult(testName, {
        success: true,
        data: mockData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      addResult(testName, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoadingState(testName, false);
    }
  };

  const getResultDisplay = (testName: string) => {
    const result = results[testName];
    if (!result) return null;
    
    return (
      <div className={`mt-2 p-3 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={result.success ? 'default' : 'destructive'}>
            {result.success ? 'Success' : 'Failed'}
          </Badge>
          <span className="text-sm text-gray-500">{result.timestamp}</span>
        </div>
        {result.success && result.data && (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
        {!result.success && result.error && (
          <p className="text-sm text-red-600">{result.error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Storage & Image Management System Test</h1>
        <p className="text-gray-600 mt-2">
          Test the comprehensive file storage, CDN management, and image optimization system
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cdn">CDN Management</TabsTrigger>
          <TabsTrigger value="images">Image Optimization</TabsTrigger>
          <TabsTrigger value="storage">Storage System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                The Storage & Image Management System provides comprehensive file handling capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Storage Buckets</h3>
                  <ul className="text-sm space-y-1">
                    <li>• property-images (public, 10MB limit)</li>
                    <li>• property-documents (private, 50MB limit)</li>
                    <li>• user-avatars (public, 5MB limit)</li>
                    <li>• temp-uploads (private, 10MB limit)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Features</h3>
                  <ul className="text-sm space-y-1">
                    <li>• CDN optimization & caching</li>
                    <li>• Image transformation & variants</li>
                    <li>• Responsive image generation</li>
                    <li>• Security policies & access control</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-semibold">Test Results Summary</h3>
                <div className="flex gap-2">
                  <Badge variant="default">
                    Total Tests: {Object.keys(results).length}
                  </Badge>
                  <Badge variant="default">
                    Success: {Object.values(results).filter(r => r.success).length}
                  </Badge>
                  <Badge variant="destructive">
                    Failed: {Object.values(results).filter(r => !r.success).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cdn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CDN Management Tests</CardTitle>
              <CardDescription>
                Test CDN optimization, caching, and performance features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Button 
                  onClick={() => testCDNManagement('upload')}
                  disabled={loading['cdn-upload']}
                  variant="outline"
                >
                  {loading['cdn-upload'] ? 'Testing...' : 'Test Upload'}
                </Button>
                <Button 
                  onClick={() => testCDNManagement('preload')}
                  disabled={loading['cdn-preload']}
                  variant="outline"
                >
                  {loading['cdn-preload'] ? 'Testing...' : 'Test Preload'}
                </Button>
                <Button 
                  onClick={() => testCDNManagement('warmup')}
                  disabled={loading['cdn-warmup']}
                  variant="outline"
                >
                  {loading['cdn-warmup'] ? 'Testing...' : 'Test Warmup'}
                </Button>
                <Button 
                  onClick={() => testCDNManagement('metrics')}
                  disabled={loading['cdn-metrics']}
                  variant="outline"
                >
                  {loading['cdn-metrics'] ? 'Testing...' : 'Test Metrics'}
                </Button>
                <Button 
                  onClick={() => testCDNManagement('optimize')}
                  disabled={loading['cdn-optimize']}
                  variant="outline"
                >
                  {loading['cdn-optimize'] ? 'Testing...' : 'Test Optimize'}
                </Button>
              </div>
              
              {Object.keys(results).filter(key => key.startsWith('cdn-')).map(key => (
                <div key={key}>
                  <h4 className="font-medium mb-2">{key.replace('cdn-', 'CDN ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                  {getResultDisplay(key)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Optimization Tests</CardTitle>
              <CardDescription>
                Test image transformation, variants, and responsive generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Button 
                  onClick={() => testImageOptimization('gallery')}
                  disabled={loading['image-optimization-gallery']}
                  variant="outline"
                >
                  {loading['image-optimization-gallery'] ? 'Testing...' : 'Gallery Variant'}
                </Button>
                <Button 
                  onClick={() => testImageOptimization('card')}
                  disabled={loading['image-optimization-card']}
                  variant="outline"
                >
                  {loading['image-optimization-card'] ? 'Testing...' : 'Card Variant'}
                </Button>
                <Button 
                  onClick={() => testImageOptimization('hero')}
                  disabled={loading['image-optimization-hero']}
                  variant="outline"
                >
                  {loading['image-optimization-hero'] ? 'Testing...' : 'Hero Variant'}
                </Button>
                <Button 
                  onClick={() => testImageOptimization('detail')}
                  disabled={loading['image-optimization-detail']}
                  variant="outline"
                >
                  {loading['image-optimization-detail'] ? 'Testing...' : 'Detail Variant'}
                </Button>
                <Button 
                  onClick={() => testImageOptimization('mobile')}
                  disabled={loading['image-optimization-mobile']}
                  variant="outline"
                >
                  {loading['image-optimization-mobile'] ? 'Testing...' : 'Mobile Variant'}
                </Button>
                <Button 
                  onClick={() => testImageOptimization()}
                  disabled={loading['image-optimization-custom']}
                  variant="outline"
                >
                  {loading['image-optimization-custom'] ? 'Testing...' : 'Custom Options'}
                </Button>
              </div>
              
              {Object.keys(results).filter(key => key.startsWith('image-optimization-')).map(key => (
                <div key={key}>
                  <h4 className="font-medium mb-2">{key.replace('image-optimization-', 'Image Optimization ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                  {getResultDisplay(key)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage System Tests</CardTitle>
              <CardDescription>
                Test storage bucket configuration and file operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={testStorageBucketInfo}
                  disabled={loading['storage-bucket-info']}
                  variant="outline"
                  className="w-full"
                >
                  {loading['storage-bucket-info'] ? 'Testing...' : 'Test Bucket Info'}
                </Button>
                <Button 
                  onClick={testFileUpload}
                  disabled={loading['file-upload']}
                  variant="outline"
                  className="w-full"
                >
                  {loading['file-upload'] ? 'Testing...' : 'Test File Upload'}
                </Button>
              </div>
              
              {Object.keys(results).filter(key => ['storage-bucket-info', 'file-upload'].includes(key)).map(key => (
                <div key={key}>
                  <h4 className="font-medium mb-2">{key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                  {getResultDisplay(key)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


































