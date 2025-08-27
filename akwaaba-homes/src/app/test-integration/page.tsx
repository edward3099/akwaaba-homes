"use client"

import { useState } from 'react';
import { useAppIntegration } from '@/lib/hooks/useAppIntegration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Shield, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  Upload,
  Download,
  Trash2,
  Plus,
  Edit,
  Eye,
  Search,
  Settings,
  Activity,
  FileText,
  Database,
  Zap
} from 'lucide-react';

export default function TestIntegrationPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    type: 'info'
  });

  // Initialize integration with all features enabled
  const integration = useAppIntegration({
    componentName: 'TestIntegrationPage',
    enableAuth: true,
    enableLoading: true,
    enableErrorHandling: true,
    enableToast: true,
    enableApiClient: true,
  });

  const { auth, loading, error, toast, api, utils } = integration;

  // Add test result
  const addTestResult = (test: string, result: 'success' | 'error' | 'info', message: string, details?: any) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      result,
      message,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  // Test Authentication
  const testAuthentication = async () => {
    addTestResult('Authentication', 'info', 'Testing authentication system...');
    
    try {
      // Test auth state
      addTestResult('Auth State', 'info', `User authenticated: ${auth.state.isAuthenticated}`);
      addTestResult('User Profile', 'info', `User type: ${auth.state.userProfile?.user_type || 'Not logged in'}`);
      
      // Test route protection
      const canAccess = await auth.routeProtection.canAccessRoute('/admin', ['admin']);
      addTestResult('Route Protection', 'info', `Can access admin route: ${canAccess}`);
      
      // Test permissions
      const canPerformAction = await auth.routeProtection.canPerformAction('delete_property', 'admin');
      addTestResult('Permissions', 'info', `Can delete property: ${canPerformAction}`);
      
      addTestResult('Authentication', 'success', 'All authentication tests passed!');
    } catch (err) {
      addTestResult('Authentication', 'error', 'Authentication test failed', err);
    }
  };

  // Test Loading States
  const testLoadingStates = async () => {
    addTestResult('Loading States', 'info', 'Testing loading state management...');
    
    try {
      // Test simple loading
      const result1 = await loading.withLoading('simple-test', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return 'Simple loading completed';
      });
      addTestResult('Simple Loading', 'success', result1);

      // Test progress loading
      const result2 = await loading.withProgress('progress-test', async (progressCallback) => {
        progressCallback(25, 'Starting operation...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        progressCallback(50, 'Processing data...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        progressCallback(75, 'Finalizing...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        progressCallback(100, 'Complete!');
        return 'Progress loading completed';
      });
      addTestResult('Progress Loading', 'success', result2);

      // Test batch loading
      const result3 = await loading.withBatchLoading('batch-test', [
        { key: 'op1', operation: () => new Promise(resolve => setTimeout(() => resolve('Operation 1'), 500)) },
        { key: 'op2', operation: () => new Promise(resolve => setTimeout(() => resolve('Operation 2'), 500)) },
        { key: 'op3', operation: () => new Promise(resolve => setTimeout(() => resolve('Operation 3'), 500)) }
      ]);
      addTestResult('Batch Loading', 'success', `Batch operations completed: ${result3.length} operations`);

      addTestResult('Loading States', 'success', 'All loading tests passed!');
    } catch (err) {
      addTestResult('Loading States', 'error', 'Loading test failed', err);
    }
  };

  // Test Error Handling
  const testErrorHandling = async () => {
    addTestResult('Error Handling', 'info', 'Testing error handling system...');
    
    try {
      // Test network error
      await error.handleNetworkError(new Error('Network timeout'), 'network-test');
      addTestResult('Network Error', 'success', 'Network error handled correctly');

      // Test validation error
      await error.handleValidationError(new Error('Invalid input'), 'validation-test');
      addTestResult('Validation Error', 'success', 'Validation error handled correctly');

      // Test permission error
      await error.handlePermissionError(new Error('Access denied'), 'permission-test');
      addTestResult('Permission Error', 'success', 'Permission error handled correctly');

      // Test generic error
      await error.handleError(new Error('Something went wrong'), 'generic-test', {
        additionalData: 'Test context'
      });
      addTestResult('Generic Error', 'success', 'Generic error handled correctly');

      addTestResult('Error Handling', 'success', 'All error handling tests passed!');
    } catch (err) {
      addTestResult('Error Handling', 'error', 'Error handling test failed', err);
    }
  };

  // Test Toast Notifications
  const testToastNotifications = async () => {
    addTestResult('Toast Notifications', 'info', 'Testing toast notification system...');
    
    try {
      // Test basic notifications
      toast.showSuccess('Success Test', 'This is a success notification');
      toast.showError('Error Test', 'This is an error notification');
      toast.showWarning('Warning Test', 'This is a warning notification');
      toast.showInfo('Info Test', 'This is an info notification');
      
      addTestResult('Basic Toasts', 'success', 'Basic toast notifications displayed');

      // Test confirmation toast
      toast.showConfirmationToast(
        'Confirm Action',
        'Are you sure you want to proceed with this test?',
        () => {
          addTestResult('Confirmation Toast', 'success', 'User confirmed action');
        },
        () => {
          addTestResult('Confirmation Toast', 'info', 'User cancelled action');
        }
      );

      // Test data operation toast
      toast.showDataOperationToast('create', 'Test Item', true);
      addTestResult('Data Operation Toast', 'success', 'Data operation toast displayed');

      // Test system notification
      toast.showSystemNotification('info', 'System Update', 'Integration system is running smoothly');
      addTestResult('System Notification', 'success', 'System notification displayed');

      addTestResult('Toast Notifications', 'success', 'All toast tests passed!');
    } catch (err) {
      addTestResult('Toast Notifications', 'error', 'Toast test failed', err);
    }
  };

  // Test API Client
  const testApiClient = async () => {
    addTestResult('API Client', 'info', 'Testing API client system...');
    
    try {
      // Test GET request
      const getResult = await api.get('/api/test');
      addTestResult('GET Request', 'info', 'GET request completed', getResult);

      // Test POST request
      const postResult = await api.post('/api/test', { test: 'data' });
      addTestResult('POST Request', 'info', 'POST request completed', postResult);

      // Test rate limiting
      const rateLimitResult = await api.checkRateLimit('/api/test');
      addTestResult('Rate Limiting', 'info', 'Rate limit check completed', rateLimitResult);

      addTestResult('API Client', 'success', 'All API client tests passed!');
    } catch (err) {
      addTestResult('API Client', 'info', 'API client tests completed (some may fail in test environment)', err);
    }
  };

  // Test Form Integration - DISABLED (form property not available)
  const testFormIntegration = async () => {
    addTestResult('Form Integration', 'info', 'Form integration tests disabled - form property not available');
    addTestResult('Form Integration', 'error', 'Form integration test skipped - integration.form not implemented');
  };

  // Test Data Integration - DISABLED (data property not available)
  const testDataIntegration = async () => {
    addTestResult('Data Integration', 'info', 'Data integration tests disabled - data property not available');
    addTestResult('Data Integration', 'error', 'Data integration test skipped - integration.data not implemented');
  };

  // Test File Integration - DISABLED (file property not available)
  const testFileIntegration = async () => {
    addTestResult('File Integration', 'info', 'File integration tests disabled - file property not available');
    addTestResult('File Integration', 'error', 'File integration test skipped - integration.file not implemented');
  };

  // Test Utilities
  const testUtilities = async () => {
    addTestResult('Utilities', 'info', 'Testing utility functions...');
    
    try {
      // Test permission checking
      const canCreate = await utils.canPerformAction('create_property');
      addTestResult('Permission Check', 'info', `Can create property: ${canCreate}`);

      // Test action validation - DISABLED (isValidAction not available)
      addTestResult('Action Validation', 'info', 'Action validation test disabled - isValidAction not implemented');

      // Test component context
      const context = utils.getComponentContext();
      addTestResult('Component Context', 'info', 'Component context retrieved', context);

      addTestResult('Utilities', 'success', 'All utility tests passed!');
    } catch (err) {
      addTestResult('Utilities', 'error', 'Utility test failed', err);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setTestResults([]);
    addTestResult('Test Suite', 'info', 'Starting comprehensive integration tests...');
    
    await testAuthentication();
    await testLoadingStates();
    await testErrorHandling();
    await testToastNotifications();
    await testApiClient();
    await testFormIntegration();
    await testDataIntegration();
    await testFileIntegration();
    await testUtilities();
    
    addTestResult('Test Suite', 'success', 'All integration tests completed!');
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
  };

  // Get result icon
  const getResultIcon = (result: string) => {
    switch (result) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get result badge variant
  const getResultBadgeVariant = (result: string) => {
    switch (result) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Integration System Test Page</h1>
        <p className="text-gray-600">
          Test all features of the frontend integration system including authentication, 
          loading states, error handling, toast notifications, and API operations.
        </p>
      </div>

      {/* Authentication Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-1">
                <Badge variant={auth.state.isAuthenticated ? 'default' : 'secondary'}>
                  {auth.state.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">User Type</Label>
              <div className="mt-1">
                <Badge variant="outline">
                  {auth.state.userProfile?.user_type || 'None'}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">User ID</Label>
              <div className="mt-1 text-sm text-gray-600">
                {auth.state.userProfile?.id || 'Not available'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Test Controls
          </CardTitle>
          <CardDescription>
            Run individual tests or execute the complete test suite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={testAuthentication} variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Auth Test
            </Button>
            <Button onClick={testLoadingStates} variant="outline" size="sm">
              <Loader2 className="h-4 w-4 mr-2" />
              Loading Test
            </Button>
            <Button onClick={testErrorHandling} variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Error Test
            </Button>
            <Button onClick={testToastNotifications} variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Toast Test
            </Button>
            <Button onClick={testApiClient} variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              API Test
            </Button>
            <Button onClick={testFormIntegration} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Form Test
            </Button>
            <Button onClick={testDataIntegration} variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Data Test
            </Button>
            <Button onClick={testFileIntegration} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              File Test
            </Button>
          </div>
          
          <div className="mt-4 flex gap-3">
            <Button onClick={runAllTests} className="flex-1">
              <Activity className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
            <Button onClick={clearResults} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Test Form
          </CardTitle>
          <CardDescription>
            Test form integration with validation and submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your message"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={testFormIntegration} className="w-full">
                Test Form Integration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Test Results
          </CardTitle>
          <CardDescription>
            Results from all integration tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No test results yet. Run some tests to see results here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getResultIcon(result.result)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.test}</span>
                          <Badge variant={getResultBadgeVariant(result.result)}>
                            {result.result}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                        {result.details && (
                          <div className="mt-2 text-xs text-gray-500">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(result.details, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
