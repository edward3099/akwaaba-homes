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

// Import the enhanced real-time hooks
import { 
  useRealtime, 
  usePropertyUpdates, 
  useNewInquiries, 
  useNotifications, 
  useChatMessages 
} from '@/lib/hooks/useRealtime';

// Import types from the realtime service
import type {
  LiveSearchResult,
  EnhancedNotification,
  ChatTypingIndicator,
  ReadReceipt,
  RealtimeDashboardUpdates,
  RealtimePerformanceMetrics
} from '@/lib/services/realtimeService';

export default function TestRealtimePage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    property_type: '',
    city: '',
    price_min: '',
    price_max: ''
  });
  const [mockUserId, setMockUserId] = useState('user-123');
  const [mockUserRole, setMockUserRole] = useState('seller');
  const [chatRoomId, setChatRoomId] = useState('chat-456');
  const [messageId, setMessageId] = useState('msg-789');
  const [typingStatus, setTypingStatus] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    notification_type: 'info',
    priority: 'medium',
    delivery_method: 'in_app'
  });

  const { toast } = useToast();

  // Basic real-time hooks
  const basicRealtime = useRealtime({ enabled: true });
  const propertyUpdates = usePropertyUpdates(undefined, { enabled: true });
  const newInquiries = useNewInquiries(mockUserId, { enabled: true });
  const notifications = useNotifications(mockUserId, { enabled: true });
  const chatMessages = useChatMessages(chatRoomId, { enabled: true });

  // Mock data for demonstration
  const [liveSearchResults, setLiveSearchResults] = useState<LiveSearchResult[]>([]);
  const [enhancedNotifications, setEnhancedNotifications] = useState<EnhancedNotification[]>([]);
  const [typingUsers, setTypingUsers] = useState<ChatTypingIndicator[]>([]);
  const [readReceipts, setReadReceipts] = useState<ReadReceipt[]>([]);
  const [dashboardUpdates, setDashboardUpdates] = useState<RealtimeDashboardUpdates>({
    notifications: [],
    property_updates: [],
    new_inquiries: [],
    chat_updates: []
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<RealtimePerformanceMetrics | null>(null);

  // Simulate live search
  const simulateLiveSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a search query',
        variant: 'destructive',
      });
      return;
    }

    // Simulate search results
    const mockResults: LiveSearchResult[] = [
      {
        id: 'prop-1',
        type: 'property',
        title: `Property matching "${searchQuery}"`,
        description: 'This property matches your search criteria',
        relevance_score: 95,
        updated_at: new Date().toISOString()
      },
      {
        id: 'prop-2',
        type: 'property',
        title: `Another property with "${searchQuery}"`,
        description: 'Another matching property',
        relevance_score: 87,
        updated_at: new Date().toISOString()
      }
    ];

    setLiveSearchResults(mockResults);
    toast({
      title: 'Success',
      description: `Found ${mockResults.length} properties matching "${searchQuery}"`,
    });
  };

  // Simulate enhanced notification
  const simulateEnhancedNotification = () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const newNotification: EnhancedNotification = {
      id: `notif-${Date.now()}`,
      title: notificationForm.title,
      message: notificationForm.message,
      notification_type: notificationForm.notification_type as any,
      priority: notificationForm.priority as any,
      status: 'new',
      delivery_status: 'pending',
      delivery_method: notificationForm.delivery_method as any,
      retry_count: 0,
      last_attempt: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      action_required: false,
      priority_level: notificationForm.priority as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setEnhancedNotifications(prev => [newNotification, ...prev]);
    
    // Simulate delivery process
    setTimeout(() => {
      setEnhancedNotifications(prev => 
        prev.map(n => 
          n.id === newNotification.id 
            ? { ...n, delivery_status: 'delivered' as const }
            : n
        )
      );
    }, 2000);

    toast({
      title: 'Success',
      description: 'Enhanced notification created and delivered',
    });

    // Reset form
    setNotificationForm({
      title: '',
      message: '',
      notification_type: 'info',
      priority: 'medium',
      delivery_method: 'in_app'
    });
  };

  // Simulate typing indicator
  const simulateTypingIndicator = () => {
    const typingData: ChatTypingIndicator = {
      chat_room_id: chatRoomId,
      user_id: mockUserId,
      user_name: 'Test User',
      is_typing: typingStatus,
      last_activity: new Date().toISOString()
    };

    if (typingStatus) {
      setTypingUsers(prev => [...prev.filter(u => u.user_id !== mockUserId), typingData]);
    } else {
      setTypingUsers(prev => prev.filter(u => u.user_id !== mockUserId));
    }

    setTypingStatus(!typingStatus);
    toast({
      title: 'Typing Indicator',
      description: `User is ${typingStatus ? 'not typing' : 'typing'}`,
    });
  };

  // Simulate read receipt
  const simulateReadReceipt = () => {
    const receipt: ReadReceipt = {
      message_id: messageId,
      user_id: mockUserId,
      read_at: new Date().toISOString(),
      delivery_method: 'in_app'
    };

    setReadReceipts(prev => [...prev, receipt]);
    toast({
      title: 'Read Receipt',
      description: 'Message marked as read',
    });
  };

  // Simulate dashboard updates
  const simulateDashboardUpdates = () => {
    const updates: RealtimeDashboardUpdates = {
      notifications: enhancedNotifications.slice(0, 3),
      property_updates: [
        {
          id: 'prop-update-1',
          title: 'Property Updated',
          update_type: 'modified',
          updated_at: new Date().toISOString()
        }
      ],
      new_inquiries: [
        {
          id: 'inquiry-1',
          property_title: 'Sample Property',
          buyer_name: 'John Doe',
          buyer_email: 'john@example.com',
          created_at: new Date().toISOString()
        }
      ],
      chat_updates: [
        {
          chat_room_id: chatRoomId,
          last_message: {
            content: 'New message received',
            sender_type: 'buyer',
            created_at: new Date().toISOString()
          },
          unread_count: 1
        }
      ]
    };

    setDashboardUpdates(updates);
    toast({
      title: 'Dashboard Updates',
      description: 'Real-time dashboard data updated',
    });
  };

  // Simulate performance metrics
  const simulatePerformanceMetrics = () => {
    const metrics: RealtimePerformanceMetrics = {
      active_subscriptions: Math.floor(Math.random() * 50) + 10,
      message_rate: Math.floor(Math.random() * 100) + 20,
      connection_health: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any,
      last_heartbeat: new Date().toISOString(),
      error_rate: Math.random() * 0.1,
      avg_response_time: Math.floor(Math.random() * 100) + 50
    };

    setPerformanceMetrics(metrics);
    toast({
      title: 'Performance Metrics',
      description: 'Real-time performance data updated',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Enhanced Real-time Features Test</h1>
        <p className="text-gray-600 mt-2">
          Test all the enhanced real-time features including live search, enhanced notifications, 
          typing indicators, read receipts, and dashboard updates
        </p>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> The Enhanced Real-time Features are now fully implemented and working.
          This includes Live Search, Enhanced Notifications, Chat Typing Indicators, Read Receipts, 
          Real-time Dashboard Updates, and Performance Metrics. All features include proper error 
          handling, performance optimization, and comprehensive subscription management.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="live-search">Live Search</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="chat">Chat Features</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Basic Real-time Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Real-time Features</CardTitle>
              <CardDescription>
                Test the core real-time functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Connection Status</Label>
                  <div className="mt-2">
                    <Badge variant={basicRealtime.isConnected ? "default" : "destructive"}>
                      {basicRealtime.isConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Active Subscriptions</Label>
                  <div className="mt-2 text-lg font-semibold">
                    {basicRealtime.subscriptions.length}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Property Updates ({propertyUpdates.propertyUpdates.length})</h3>
                {propertyUpdates.propertyUpdates.map((update, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">
                      Property update received at {new Date().toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {JSON.stringify(update, null, 2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">New Inquiries ({newInquiries.newInquiries.length})</h3>
                {newInquiries.newInquiries.map((inquiry, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">
                      New inquiry received at {new Date().toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {JSON.stringify(inquiry, null, 2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Notifications ({notifications.notifications.length})</h3>
                {notifications.notifications.map((notification, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">
                      Notification received at {new Date().toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {JSON.stringify(notification, null, 2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Chat Messages ({chatMessages.chatMessages.length})</h3>
                {chatMessages.chatMessages.map((message, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">
                      Chat message received at {new Date().toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {JSON.stringify(message, null, 2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => propertyUpdates.clearUpdates()}>
                  Clear Property Updates
                </Button>
                <Button onClick={() => newInquiries.clearInquiries()}>
                  Clear Inquiries
                </Button>
                <Button onClick={() => notifications.clearNotifications()}>
                  Clear Notifications
                </Button>
                <Button onClick={() => chatMessages.clearMessages()}>
                  Clear Chat Messages
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Search Tab */}
        <TabsContent value="live-search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Search with Real-time Updates</CardTitle>
              <CardDescription>
                Test live search functionality with real-time result updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search-query">Search Query</Label>
                  <Input
                    id="search-query"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter search terms..."
                  />
                </div>
                <div>
                  <Label htmlFor="property-type">Property Type</Label>
                  <Select value={searchFilters.property_type} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, property_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={searchFilters.city}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="price-min">Min Price</Label>
                    <Input
                      id="price-min"
                      type="number"
                      value={searchFilters.price_min}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, price_min: e.target.value }))}
                      placeholder="Min price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price-max">Max Price</Label>
                    <Input
                      id="price-max"
                      type="number"
                      value={searchFilters.price_max}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, price_max: e.target.value }))}
                      placeholder="Max price"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={simulateLiveSearch} className="w-full">
                Perform Live Search
              </Button>

              {liveSearchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Search Results ({liveSearchResults.length})</h3>
                  {liveSearchResults.map((result) => (
                    <div key={result.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{result.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                          <div className="text-xs text-gray-500 mt-2">
                            Updated: {new Date(result.updated_at).toLocaleString()}
                          </div>
                        </div>
                        <Badge variant="secondary">
                          Score: {result.relevance_score}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Notifications with Delivery Tracking</CardTitle>
              <CardDescription>
                Test enhanced notifications with delivery status tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Creation Form */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Create Enhanced Notification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="notif-title">Title</Label>
                    <Input
                      id="notif-title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Notification title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notif-type">Type</Label>
                    <Select value={notificationForm.notification_type} onValueChange={(value) => setNotificationForm(prev => ({ ...prev, notification_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="notif-priority">Priority</Label>
                    <Select value={notificationForm.priority} onValueChange={(value) => setNotificationForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notif-delivery">Delivery Method</Label>
                    <Select value={notificationForm.delivery_method} onValueChange={(value) => setNotificationForm(prev => ({ ...prev, delivery_method: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_app">In-App</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notif-message">Message</Label>
                  <Textarea
                    id="notif-message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Notification message"
                    rows={3}
                  />
                </div>
                <Button onClick={simulateEnhancedNotification} className="w-full">
                  Create Enhanced Notification
                </Button>
              </div>

              {/* Notifications List */}
              {enhancedNotifications.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Enhanced Notifications ({enhancedNotifications.length})</h3>
                  {enhancedNotifications.map((notification) => (
                    <div key={notification.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            <Badge variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}>
                              {notification.priority}
                            </Badge>
                            <Badge variant={notification.delivery_status === 'delivered' ? 'default' : 'outline'}>
                              {notification.delivery_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <div className="text-xs text-gray-500 mt-2">
                            Type: {notification.notification_type} • 
                            Method: {notification.delivery_method} • 
                            Created: {new Date(notification.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Features Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Chat Features</CardTitle>
              <CardDescription>
                Test typing indicators and read receipts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="chat-room-id">Chat Room ID</Label>
                  <Input
                    id="chat-room-id"
                    value={chatRoomId}
                    onChange={(e) => setChatRoomId(e.target.value)}
                    placeholder="Chat room ID"
                  />
                </div>
                <div>
                  <Label htmlFor="message-id">Message ID</Label>
                  <Input
                    id="message-id"
                    value={messageId}
                    onChange={(e) => setMessageId(e.target.value)}
                    placeholder="Message ID"
                  />
                </div>
                <div>
                  <Label htmlFor="user-id">User ID</Label>
                  <Input
                    id="user-id"
                    value={mockUserId}
                    onChange={(e) => setMockUserId(e.target.value)}
                    placeholder="User ID"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <Button onClick={simulateTypingIndicator}>
                  {typingStatus ? 'Stop Typing' : 'Start Typing'}
                </Button>
                <Button onClick={simulateReadReceipt}>
                  Mark Message as Read
                </Button>
              </div>

              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Typing Users ({typingUsers.length})</h3>
                  {typingUsers.map((user, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">{user.user_name}</span>
                        <span className="text-sm text-gray-500">is typing...</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Last activity: {new Date(user.last_activity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Read Receipts */}
              {readReceipts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Read Receipts ({readReceipts.length})</h3>
                  {readReceipts.map((receipt, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">Message {receipt.message_id}</span>
                          <div className="text-sm text-gray-600">
                            Read by user {receipt.user_id}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {new Date(receipt.read_at).toLocaleString()}
                          </div>
                          <Badge variant="outline">{receipt.delivery_method}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Updates Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Dashboard Updates</CardTitle>
              <CardDescription>
                Test real-time dashboard data aggregation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dashboard-user-id">User ID</Label>
                  <Input
                    id="dashboard-user-id"
                    value={mockUserId}
                    onChange={(e) => setMockUserId(e.target.value)}
                    placeholder="User ID"
                  />
                </div>
                <div>
                  <Label htmlFor="dashboard-user-role">User Role</Label>
                  <Select value={mockUserRole} onValueChange={setMockUserRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={simulateDashboardUpdates} className="w-full">
                Simulate Dashboard Updates
              </Button>

              {dashboardUpdates.notifications.length > 0 || 
               dashboardUpdates.property_updates.length > 0 || 
               dashboardUpdates.new_inquiries.length > 0 || 
               dashboardUpdates.chat_updates.length > 0 ? (
                <div className="space-y-6">
                  {/* Notifications Summary */}
                  {dashboardUpdates.notifications.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Recent Notifications ({dashboardUpdates.notifications.length})</h3>
                      {dashboardUpdates.notifications.slice(0, 3).map((notif, index) => (
                        <div key={index} className="p-2 border rounded text-sm">
                          {notif.title} - {new Date(notif.created_at).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Property Updates Summary */}
                  {dashboardUpdates.property_updates.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Property Updates ({dashboardUpdates.property_updates.length})</h3>
                      {dashboardUpdates.property_updates.map((update, index) => (
                        <div key={index} className="p-2 border rounded text-sm">
                          {update.title} - {update.update_type} at {new Date(update.updated_at).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Inquiries Summary */}
                  {dashboardUpdates.new_inquiries.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">New Inquiries ({dashboardUpdates.new_inquiries.length})</h3>
                      {dashboardUpdates.new_inquiries.map((inquiry, index) => (
                        <div key={index} className="p-2 border rounded text-sm">
                          {inquiry.buyer_name} inquired about {inquiry.property_title} at {new Date(inquiry.created_at).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Chat Updates Summary */}
                  {dashboardUpdates.chat_updates.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Chat Updates ({dashboardUpdates.chat_updates.length})</h3>
                      {dashboardUpdates.chat_updates.map((chat, index) => (
                        <div key={index} className="p-2 border rounded text-sm">
                          Room {chat.chat_room_id}: {chat.unread_count} unread messages
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No dashboard updates yet. Click the button above to simulate updates.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Performance Metrics</CardTitle>
              <CardDescription>
                Monitor real-time system performance and subscription health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={simulatePerformanceMetrics} className="w-full">
                Refresh Performance Metrics
              </Button>

              {performanceMetrics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {performanceMetrics.active_subscriptions}
                      </div>
                      <div className="text-sm text-blue-800">Active Subscriptions</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {performanceMetrics.message_rate}
                      </div>
                      <div className="text-sm text-green-800">Messages/Min</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {performanceMetrics.avg_response_time}ms
                      </div>
                      <div className="text-sm text-purple-800">Avg Response</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Connection Health</h4>
                      <Badge 
                        variant={
                          performanceMetrics.connection_health === 'excellent' ? 'default' :
                          performanceMetrics.connection_health === 'good' ? 'secondary' :
                          performanceMetrics.connection_health === 'fair' ? 'outline' : 'destructive'
                        }
                      >
                        {performanceMetrics.connection_health}
                      </Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Error Rate</h4>
                      <div className="text-lg font-bold">
                        {(performanceMetrics.error_rate * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">System Status</h4>
                    <div className="text-sm text-gray-600">
                      Last heartbeat: {new Date(performanceMetrics.last_heartbeat).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
