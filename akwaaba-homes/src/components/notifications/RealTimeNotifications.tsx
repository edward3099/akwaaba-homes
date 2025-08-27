'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  Bell, 
  MessageSquare, 
  Home, 
  Star, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Settings,
  Eye,
  Archive,
  Trash2,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react';

// Types for our notification system
interface Notification {
  id: string;
  type: 'property_inquiry' | 'property_update' | 'payment_success' | 'payment_failed' | 'system_alert' | 'premium_feature' | 'market_update';
  title: string;
  message: string;
  user_id: string;
  property_id?: string;
  inquiry_id?: string;
  payment_id?: string;
  is_read: boolean;
  is_archived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  read_at?: string;
  metadata?: {
    amount?: number;
    currency?: string;
    location?: string;
    property_title?: string;
    buyer_name?: string;
    buyer_email?: string;
  };
}

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  property_inquiries: boolean;
  payment_updates: boolean;
  market_alerts: boolean;
  system_notifications: boolean;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  high_priority: number;
  today: number;
  this_week: number;
}

const NOTIFICATION_ICONS = {
  property_inquiry: MessageSquare,
  property_update: Home,
  payment_success: CheckCircle,
  payment_failed: XCircle,
  system_alert: AlertTriangle,
  premium_feature: Star,
  market_update: DollarSign,
};

const NOTIFICATION_COLORS = {
  property_inquiry: 'bg-blue-100 text-blue-800',
  property_update: 'bg-green-100 text-green-800',
  payment_success: 'bg-green-100 text-green-800',
  payment_failed: 'bg-red-100 text-red-800',
  system_alert: 'bg-yellow-100 text-yellow-800',
  premium_feature: 'bg-purple-100 text-purple-800',
  market_update: 'bg-indigo-100 text-indigo-800',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    high_priority: 0,
    today: 0,
    this_week: 0,
  });
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    property_inquiries: true,
    payment_updates: true,
    market_alerts: true,
    system_notifications: true,
    quiet_hours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all',
    priority: 'all',
    read: 'all',
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/notifications/realtime');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      updateStats(data.notifications || []);
      applyFilters(data.notifications || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      console.error('Notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update notification statistics
  const updateStats = (notifs: Notification[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats: NotificationStats = {
      total: notifs.length,
      unread: notifs.filter(n => !n.is_read).length,
      high_priority: notifs.filter(n => n.priority === 'high' || n.priority === 'urgent').length,
      today: notifs.filter(n => new Date(n.created_at) >= today).length,
      this_week: notifs.filter(n => new Date(n.created_at) >= weekAgo).length,
    };

    setStats(stats);
  };

  // Apply filters to notifications
  const applyFilters = (notifs: Notification[]) => {
    let filtered = [...notifs];

    if (filter.type !== 'all') {
      filtered = filtered.filter(n => n.type === filter.type);
    }

    if (filter.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }

    if (filter.read !== 'all') {
      filtered = filtered.filter(n => 
        filter.read === 'read' ? n.is_read : !n.is_read
      );
    }

    setFilteredNotifications(filtered);
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/realtime/${notificationId}/read`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );

      updateStats(notifications);
      applyFilters(notifications);

    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  // Mark notification as archived
  const markAsArchived = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/realtime/${notificationId}/archive`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to archive notification');

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_archived: true }
            : n
        )
      );

      updateStats(notifications);
      applyFilters(notifications);

    } catch (err) {
      console.error('Archive error:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/realtime/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      updateStats(notifications);
      applyFilters(notifications);

    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/realtime/mark-all-read', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );

      updateStats(notifications);
      applyFilters(notifications);

    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  // Setup Server-Sent Events connection
  const setupSSEConnection = () => {
    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create new SSE connection
      const eventSource = new EventSource('/api/notifications/realtime', {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log('SSE connection established');
      };

      eventSource.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          
          // Add new notification to the top
          setNotifications(prev => [notification, ...prev]);
          
          // Play notification sound if enabled
          if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(console.error);
          }

          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: notification.id,
            });
          }

        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          setupSSEConnection();
        }, 5000);
      };

      eventSourceRef.current = eventSource;

    } catch (err) {
      console.error('SSE setup error:', err);
      setIsConnected(false);
    }
  };

  // Update notification preferences
  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) throw new Error('Failed to update preferences');

      setPreferences(prev => ({ ...prev, ...newPreferences }));

    } catch (err) {
      console.error('Preferences update error:', err);
    }
  };

  // Request notification permissions
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    }
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Filter notifications based on active tab
  useEffect(() => {
    let filtered = [...notifications];

    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(n => !n.is_read);
        break;
      case 'high-priority':
        filtered = filtered.filter(n => n.priority === 'high' || n.priority === 'urgent');
        break;
      case 'property':
        filtered = filtered.filter(n => n.type === 'property_inquiry' || n.type === 'property_update');
        break;
      case 'payments':
        filtered = filtered.filter(n => n.type === 'payment_success' || n.type === 'payment_failed');
        break;
      case 'archived':
        filtered = filtered.filter(n => n.is_archived);
        break;
      default:
        filtered = filtered.filter(n => !n.is_archived);
    }

    setFilteredNotifications(filtered);
  }, [activeTab, notifications]);

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters(notifications);
  }, [filter, notifications]);

  // Setup SSE connection on component mount
  useEffect(() => {
    fetchNotifications();
    setupSSEConnection();
    requestNotificationPermission();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const renderNotificationCard = (notification: Notification) => {
    const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
    const typeColor = NOTIFICATION_COLORS[notification.type] || 'bg-gray-100 text-gray-800';
    const priorityColor = PRIORITY_COLORS[notification.priority];

    return (
      <Card key={notification.id} className={`mb-3 transition-all hover:shadow-md ${
        notification.is_read ? 'opacity-75' : 'border-l-4 border-l-blue-500'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${typeColor}`}>
              <IconComponent className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge className={priorityColor} variant="secondary">
                    {notification.priority}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
              
              {notification.metadata && (
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  {notification.metadata.property_title && (
                    <div>Property: {notification.metadata.property_title}</div>
                  )}
                  {notification.metadata.buyer_name && (
                    <div>From: {notification.metadata.buyer_name}</div>
                  )}
                  {notification.metadata.amount && (
                    <div>Amount: ${notification.metadata.amount} {notification.metadata.currency}</div>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {!notification.is_read && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Mark as Read
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => markAsArchived(notification.id)}
                >
                  <Archive className="h-3 w-3 mr-1" />
                  Archive
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => deleteNotification(notification.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">Stay updated with real-time notifications</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSound}
                className={soundEnabled ? 'text-green-600' : 'text-gray-400'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotifications}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={markAllAsRead}
                disabled={stats.unread === 0}
                size="sm"
              >
                Mark All Read
              </Button>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Real-time connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
              <p className="text-sm text-gray-600">Unread</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.high_priority}</div>
              <p className="text-sm text-gray-600">High Priority</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.today}</div>
              <p className="text-sm text-gray-600">Today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.this_week}</div>
              <p className="text-sm text-gray-600">This Week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Customize your notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <select
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={filter.type}
                    onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="all">All Types</option>
                    <option value="property_inquiry">Property Inquiries</option>
                    <option value="property_update">Property Updates</option>
                    <option value="payment_success">Payment Success</option>
                    <option value="payment_failed">Payment Failed</option>
                    <option value="system_alert">System Alerts</option>
                    <option value="premium_feature">Premium Features</option>
                    <option value="market_update">Market Updates</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={filter.priority}
                    onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={filter.read}
                    onChange={(e) => setFilter(prev => ({ ...prev, read: e.target.value }))}
                  >
                    <option value="all">All</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="high-priority">High Priority</TabsTrigger>
                    <TabsTrigger value="property">Property</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="archived">Archived</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  <div className="h-[600px] pr-4 overflow-y-auto">
                    {filteredNotifications.map(renderNotificationCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                    <p className="text-gray-500">You're all caught up!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden audio element for notification sounds */}
        <audio ref={audioRef} preload="auto">
          <source src="/notification-sound.mp3" type="audio/mpeg" />
        </audio>
      </div>
    </div>
  );
}
