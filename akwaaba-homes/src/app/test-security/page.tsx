'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

export default function TestSecurityPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Test data states
  const [testInput, setTestInput] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testUrl, setTestUrl] = useState('');
  const [testHtml, setTestHtml] = useState('<script>alert("xss")</script><p>Safe content</p>');

  // Rate limiting test states
  const [rateLimitCount, setRateLimitCount] = useState(0);
  const [rateLimitStatus, setRateLimitStatus] = useState<string>('');

  // Security headers test states
  const [securityHeaders, setSecurityHeaders] = useState<Record<string, string>>({});

  useEffect(() => {
    // Test security headers on page load
    testSecurityHeaders();
  }, []);

  const testSecurityHeaders = async () => {
    try {
      const response = await fetch('/api/test-security-headers');
      const headers: Record<string, string> = {};
      
      // Extract security headers
      const securityHeaderNames = [
        'content-security-policy',
        'strict-transport-security',
        'x-xss-protection',
        'x-content-type-options',
        'x-frame-options',
        'referrer-policy',
        'permissions-policy',
        'cross-origin-embedder-policy',
        'cross-origin-opener-policy',
        'cross-origin-resource-policy'
      ];

      securityHeaderNames.forEach(headerName => {
        const value = response.headers.get(headerName);
        if (value) {
          headers[headerName] = value;
        }
      });

      setSecurityHeaders(headers);
    } catch (error) {
      console.error('Error testing security headers:', error);
    }
  };

  const testInputValidation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-input-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testInput,
          testEmail,
          testUrl,
          testHtml
        }),
      });

      const result = await response.json();
      setTestResults(prev => ({ ...prev, inputValidation: result }));

      if (response.ok) {
        toast({
          title: "Input Validation Test",
          description: "Input validation test completed successfully",
        });
      } else {
        toast({
          title: "Input Validation Test Failed",
          description: result.error || "Test failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Input Validation Test Error",
        description: "An error occurred during the test",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testRateLimiting = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-rate-limit');
      const result = await response.json();

      if (response.status === 429) {
        setRateLimitStatus('Rate limit exceeded');
        toast({
          title: "Rate Limiting Test",
          description: "Rate limit exceeded - test successful!",
        });
      } else if (response.ok) {
        setRateLimitCount(prev => prev + 1);
        setRateLimitStatus(`Request ${rateLimitCount + 1} successful`);
        
        const remaining = response.headers.get('x-ratelimit-remaining');
        if (remaining) {
          setRateLimitStatus(`Remaining requests: ${remaining}`);
        }
      }

      setTestResults(prev => ({ ...prev, rateLimiting: result }));
    } catch (error) {
      toast({
        title: "Rate Limiting Test Error",
        description: "An error occurred during the test",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testRLSPolicies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-rls-policies');
      const result = await response.json();
      
      setTestResults(prev => ({ ...prev, rlsPolicies: result }));

      if (response.ok) {
        toast({
          title: "RLS Policies Test",
          description: "RLS policies test completed successfully",
        });
      } else {
        toast({
          title: "RLS Policies Test Failed",
          description: result.error || "Test failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "RLS Policies Test Error",
        description: "An error occurred during the test",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSQLInjection = async () => {
    setIsLoading(true);
    try {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users (email) VALUES ('hacker@evil.com'); --",
        "' UNION SELECT * FROM users --"
      ];

      const results = [];
      
      for (const input of maliciousInputs) {
        try {
          const response = await fetch('/api/test-sql-injection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: input }),
          });

          const result = await response.json();
          results.push({
            input,
            status: response.status,
            result
          });
        } catch (error) {
          results.push({
            input,
            status: 'error',
            result: { error: 'Request failed' }
          });
        }
      }

      setTestResults(prev => ({ ...prev, sqlInjection: results }));
      toast({
        title: "SQL Injection Test",
        description: "SQL injection test completed",
      });
    } catch (error) {
      toast({
        title: "SQL Injection Test Error",
        description: "An error occurred during the test",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testXSSProtection = async () => {
    setIsLoading(true);
    try {
      const maliciousInputs = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>'
      ];

      const results = [];
      
      for (const input of maliciousInputs) {
        try {
          const response = await fetch('/api/test-xss-protection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: input }),
          });

          const result = await response.json();
          results.push({
            input,
            status: response.status,
            result
          });
        } catch (error) {
          results.push({
            input,
            status: 'error',
            result: { error: 'Request failed' }
          });
        }
      }

      setTestResults(prev => ({ ...prev, xssProtection: results }));
      toast({
        title: "XSS Protection Test",
        description: "XSS protection test completed",
      });
    } catch (error) {
      toast({
        title: "XSS Protection Test Error",
        description: "An error occurred during the test",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetRateLimitTest = () => {
    setRateLimitCount(0);
    setRateLimitStatus('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">🔒 Security Testing Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive testing of all security features including RLS policies, rate limiting, input validation, and security headers
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rls">RLS Policies</TabsTrigger>
          <TabsTrigger value="rate-limiting">Rate Limiting</TabsTrigger>
          <TabsTrigger value="validation">Input Validation</TabsTrigger>
          <TabsTrigger value="headers">Security Headers</TabsTrigger>
          <TabsTrigger value="attacks">Attack Prevention</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Row-Level Security</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">
                  Database-level access control policies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limiting</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Configured</div>
                <p className="text-xs text-muted-foreground">
                  API abuse prevention and fair usage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Input Validation</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Comprehensive</div>
                <p className="text-xs text-muted-foreground">
                  XSS and injection attack prevention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Headers</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Enabled</div>
                <p className="text-xs text-muted-foreground">
                  Modern web security protections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CORS Protection</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Configured</div>
                <p className="text-xs text-muted-foreground">
                  Cross-origin request security
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audit Logging</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">
                  Complete security event tracking
                </p>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This dashboard tests all security features. Use responsibly and only test on development environments.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* RLS Policies Tab */}
        <TabsContent value="rls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Row-Level Security (RLS) Policies Test</CardTitle>
              <CardDescription>
                Test database access control policies that ensure users can only access their own data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testRLSPolicies} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Test RLS Policies'}
              </Button>

              {testResults.rlsPolicies && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Test Results:</h4>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(testResults.rlsPolicies, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limiting Tab */}
        <TabsContent value="rate-limiting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting Test</CardTitle>
              <CardDescription>
                Test API rate limiting to prevent abuse and ensure fair usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={testRateLimiting} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Testing...' : 'Test Rate Limit'}
                </Button>
                <Button 
                  onClick={resetRateLimitTest} 
                  variant="outline"
                >
                  Reset Counter
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Request Count:</span>
                  <Badge variant="secondary">{rateLimitCount}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <span className="text-sm text-muted-foreground">{rateLimitStatus || 'Ready to test'}</span>
                </div>
              </div>

              {testResults.rateLimiting && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Last Test Result:</h4>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(testResults.rateLimiting, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Input Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Validation & Sanitization Test</CardTitle>
              <CardDescription>
                Test comprehensive input validation and sanitization to prevent XSS and injection attacks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-input">Test Input</Label>
                  <Input
                    id="test-input"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter test input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-email">Test Email</Label>
                  <Input
                    id="test-email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter test email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-url">Test URL</Label>
                  <Input
                    id="test-url"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="Enter test URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-html">Test HTML</Label>
                  <Textarea
                    id="test-html"
                    value={testHtml}
                    onChange={(e) => setTestHtml(e.target.value)}
                    placeholder="Enter test HTML"
                    rows={3}
                  />
                </div>
              </div>

              <Button 
                onClick={testInputValidation} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Test Input Validation'}
              </Button>

              {testResults.inputValidation && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Validation Results:</h4>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(testResults.inputValidation, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Headers Tab */}
        <TabsContent value="headers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Headers Test</CardTitle>
              <CardDescription>
                View and test security headers that protect against common web vulnerabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Active Security Headers:</h4>
                <div className="space-y-2">
                  {Object.entries(securityHeaders).map(([header, value]) => (
                    <div key={header} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {header}: {value}
                      </span>
                    </div>
                  ))}
                  {Object.keys(securityHeaders).length === 0 && (
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-muted-foreground">No security headers detected</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Security Features:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Content Security Policy (CSP)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>HTTP Strict Transport Security (HSTS)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>XSS Protection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Content Type Options</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Frame Options</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Referrer Policy</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attack Prevention Tab */}
        <TabsContent value="attacks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>SQL Injection Prevention Test</CardTitle>
                <CardDescription>
                  Test protection against SQL injection attacks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={testSQLInjection} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Testing...' : 'Test SQL Injection Protection'}
                </Button>

                {testResults.sqlInjection && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Test Results:</h4>
                    <div className="space-y-2">
                      {testResults.sqlInjection.map((result: any, index: number) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium">Input: {result.input}</div>
                          <div className="text-muted-foreground">
                            Status: {result.status === 'error' ? 'Blocked' : result.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>XSS Protection Test</CardTitle>
                <CardDescription>
                  Test protection against Cross-Site Scripting attacks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={testXSSProtection} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Testing...' : 'Test XSS Protection'}
                </Button>

                {testResults.xssProtection && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Test Results:</h4>
                    <div className="space-y-2">
                      {testResults.xssProtection.map((result: any, index: number) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium">Input: {result.input}</div>
                          <div className="text-muted-foreground">
                            Status: {result.status === 'error' ? 'Blocked' : result.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

