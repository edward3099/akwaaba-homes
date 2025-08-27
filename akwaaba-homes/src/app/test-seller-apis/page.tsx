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

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  listing_type: string;
  status: string;
  views_count: number;
  created_at: string;
}

interface Inquiry {
  id: string;
  property_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  response_message?: string;
}

interface Analytics {
  overview: {
    total_properties: number;
    active_properties: number;
    total_views: number;
    total_inquiries: number;
    response_rate: number;
  };
  trends: {
    views_change_percent: number;
    inquiries_change_percent: number;
  };
}

interface Communication {
  id: string;
  inquiry_id: string;
  message: string;
  message_type: string;
  status: string;
  created_at: string;
  scheduled_send?: string;
}

export default function TestSellerAPIsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [messageForm, setMessageForm] = useState({
    inquiry_id: '',
    message: '',
    message_type: 'response' as const,
    scheduled_send: ''
  });
  const [bulkMessageForm, setBulkMessageForm] = useState({
    inquiry_ids: [] as string[],
    message: '',
    message_type: 'response' as const,
    scheduled_send: ''
  });
  const { toast } = useToast();

  // Test Property Management APIs
  const testPropertyAPIs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seller/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data.data.properties || []);
        toast({
          title: 'Success',
          description: `Retrieved ${data.data.properties?.length || 0} properties`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch properties',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test property APIs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Test Inquiry Management APIs
  const testInquiryAPIs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seller/inquiries');
      if (response.ok) {
        const data = await response.json();
        setInquiries(data.data.inquiries || []);
        toast({
          title: 'Success',
          description: `Retrieved ${data.data.inquiries?.length || 0} inquiries`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch inquiries',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test inquiry APIs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Test Analytics APIs
  const testAnalyticsAPIs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/seller/analytics?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data.analytics);
        toast({
          title: 'Success',
          description: 'Analytics data retrieved successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch analytics',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test analytics APIs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Test Communication APIs
  const testCommunicationAPIs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seller/communication');
      if (response.ok) {
        const data = await response.json();
        setCommunications(data.data.messages || []);
        toast({
          title: 'Success',
          description: `Retrieved ${data.data.messages?.length || 0} communications`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch communications',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test communication APIs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Send individual message
  const sendMessage = async () => {
    if (!messageForm.inquiry_id || !messageForm.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/seller/communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageForm),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `Message ${data.data.status} successfully`,
        });
        setMessageForm({ inquiry_id: '', message: '', message_type: 'response', scheduled_send: '' });
        testCommunicationAPIs(); // Refresh communications
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Send bulk message
  const sendBulkMessage = async () => {
    if (bulkMessageForm.inquiry_ids.length === 0 || !bulkMessageForm.message) {
      toast({
        title: 'Error',
        description: 'Please select inquiries and enter a message',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/seller/communication/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkMessageForm),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `Bulk message ${data.data.status} to ${data.data.messages_sent} inquiries`,
        });
        setBulkMessageForm({ inquiry_ids: [], message: '', message_type: 'response', scheduled_send: '' });
        testCommunicationAPIs(); // Refresh communications
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send bulk message',
          variant: 'destructive',
      });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send bulk message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate report
  const generateReport = async (reportType: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/seller/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: reportType, format: 'json' }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `${reportType} report generated successfully`,
        });
        console.log('Report data:', data.data.report);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to generate report',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle inquiry selection for bulk messaging
  const toggleInquirySelection = (inquiryId: string) => {
    setBulkMessageForm(prev => ({
      ...prev,
      inquiry_ids: prev.inquiry_ids.includes(inquiryId)
        ? prev.inquiry_ids.filter(id => id !== inquiryId)
        : [...prev.inquiry_ids, inquiryId]
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Seller Dashboard APIs Test</h1>
        <p className="text-gray-600 mt-2">
          Test all the seller dashboard backend APIs and functionality
        </p>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> The Seller Dashboard Backend APIs are fully implemented and working. 
          This includes Property Management, Inquiry Management, Performance Analytics, and Communication Tools.
          All APIs include proper authentication, validation, and error handling.
        </p>
      </div>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Management APIs</CardTitle>
              <CardDescription>
                Test the property management endpoints for sellers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testPropertyAPIs} disabled={loading}>
                {loading ? 'Loading...' : 'Test Property APIs'}
              </Button>
              
              {properties.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Properties ({properties.length})</h3>
                  {properties.map((property) => (
                    <div key={property.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{property.title}</div>
                      <div className="text-sm text-gray-600">
                        {property.property_type} • {property.listing_type} • ${property.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        Status: {property.status} • Views: {property.views_count}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inquiry Management APIs</CardTitle>
              <CardDescription>
                Test the inquiry management endpoints for sellers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testInquiryAPIs} disabled={loading}>
                {loading ? 'Loading...' : 'Test Inquiry APIs'}
              </Button>
              
              {inquiries.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Inquiries ({inquiries.length})</h3>
                  {inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{inquiry.buyer_name}</div>
                      <div className="text-sm text-gray-600">{inquiry.buyer_email}</div>
                      <div className="text-sm text-gray-500">
                        Status: {inquiry.status} • Priority: {inquiry.priority}
                      </div>
                      <div className="text-sm mt-1">{inquiry.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics APIs</CardTitle>
              <CardDescription>
                Test the analytics and reporting endpoints for sellers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-center">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="90d">90 Days</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={testAnalyticsAPIs} disabled={loading}>
                  {loading ? 'Loading...' : 'Get Analytics'}
                </Button>
              </div>

              {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.overview.total_properties}</div>
                    <div className="text-sm text-blue-800">Properties</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.overview.active_properties}</div>
                    <div className="text-sm text-green-800">Active</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{analytics.overview.total_views}</div>
                    <div className="text-sm text-purple-800">Views</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{analytics.overview.total_inquiries}</div>
                    <div className="text-sm text-orange-800">Inquiries</div>
                  </div>
                  <div className="p-3 bg-teal-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-teal-600">{analytics.overview.response_rate}%</div>
                    <div className="text-sm text-teal-800">Response Rate</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold">Generate Reports</h3>
                <div className="flex gap-2 flex-wrap">
                  {['performance', 'inquiries', 'views', 'properties'].map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => generateReport(type)}
                      disabled={loading}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Tools APIs</CardTitle>
              <CardDescription>
                Test the messaging and communication endpoints for sellers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={testCommunicationAPIs} disabled={loading}>
                {loading ? 'Loading...' : 'Test Communication APIs'}
              </Button>

              {/* Individual Message Form */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Send Individual Message</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inquiry_id">Inquiry ID</Label>
                    <Input
                      id="inquiry_id"
                      value={messageForm.inquiry_id}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, inquiry_id: e.target.value }))}
                      placeholder="Enter inquiry ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message_type">Message Type</Label>
                    <Select value={messageForm.message_type} onValueChange={(value: any) => setMessageForm(prev => ({ ...prev, message_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="response">Response</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="information">Information</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={messageForm.message}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your message"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduled_send">Scheduled Send (Optional)</Label>
                  <Input
                    id="scheduled_send"
                    type="datetime-local"
                    value={messageForm.scheduled_send}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, scheduled_send: e.target.value }))}
                  />
                </div>
                <Button onClick={sendMessage} disabled={loading || !messageForm.inquiry_id || !messageForm.message}>
                  Send Message
                </Button>
              </div>

              {/* Bulk Message Form */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Send Bulk Message</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bulk_message_type">Message Type</Label>
                    <Select value={bulkMessageForm.message_type} onValueChange={(value: any) => setBulkMessageForm(prev => ({ ...prev, message_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="response">Response</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="information">Information</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bulk_scheduled_send">Scheduled Send (Optional)</Label>
                    <Input
                      id="bulk_scheduled_send"
                      type="datetime-local"
                      value={bulkMessageForm.scheduled_send}
                      onChange={(e) => setBulkMessageForm(prev => ({ ...prev, scheduled_send: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bulk_message">Message</Label>
                  <Textarea
                    id="bulk_message"
                    value={bulkMessageForm.message}
                    onChange={(e) => setBulkMessageForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your bulk message"
                    rows={3}
                  />
                </div>
                
                {inquiries.length > 0 && (
                  <div>
                    <Label>Select Inquiries for Bulk Message</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                      {inquiries.map((inquiry) => (
                        <label key={inquiry.id} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={bulkMessageForm.inquiry_ids.includes(inquiry.id)}
                            onChange={() => toggleInquirySelection(inquiry.id)}
                            className="rounded"
                          />
                          <span className="text-sm">{inquiry.buyer_name} - {inquiry.buyer_email}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={sendBulkMessage} 
                  disabled={loading || bulkMessageForm.inquiry_ids.length === 0 || !bulkMessageForm.message}
                >
                  Send Bulk Message ({bulkMessageForm.inquiry_ids.length} selected)
                </Button>
              </div>

              {/* Communications List */}
              {communications.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Recent Communications ({communications.length})</h3>
                  {communications.map((comm) => (
                    <div key={comm.id} className="p-3 border rounded-lg">
                      <div className="text-sm text-gray-600">
                        Type: {comm.message_type} • Status: {comm.status}
                      </div>
                      <div className="mt-1">{comm.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(comm.created_at).toLocaleString()}
                        {comm.scheduled_send && ` • Scheduled: ${new Date(comm.scheduled_send).toLocaleString()}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

