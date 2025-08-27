import { supabase } from '@/lib/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  status: string;
  action_url?: string;
  action_data?: Record<string, any>;
  read_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  sender_type: string;
  message_content: string;
  message_type: string;
  is_read: boolean;
  read_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatRoom {
  id: string;
  room_type: string;
  property_id?: string;
  seller_id: string;
  buyer_email: string;
  buyer_name?: string;
  is_active: boolean;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  property_title?: string;
  property_type?: string;
  property_address?: string;
  unread_count: number;
  last_message?: {
    content: string;
    sender_type: string;
    created_at: string;
  };
}

export interface PropertyUpdate {
  id: string;
  title: string;
  update_type: string;
  updated_at: string;
  price?: number;
  currency?: string;
  property_type?: string;
  city?: string;
  is_featured?: boolean;
  views_count?: number;
}

export interface InquiryUpdate {
  id: string;
  property_title: string;
  buyer_name: string;
  buyer_email: string;
  created_at: string;
}

export interface ChatUpdate {
  chat_room_id: string;
  last_message: {
    content: string;
    sender_type: string;
    created_at: string;
  };
  unread_count: number;
}

export interface RealtimeDashboardUpdates {
  notifications: Notification[];
  property_updates: PropertyUpdate[];
  new_inquiries: InquiryUpdate[];
  chat_updates: ChatUpdate[];
}

export interface RealtimeSubscription {
  id: string;
  channel: RealtimeChannel;
  type: string;
  filters?: Record<string, any>;
  lastActivity?: number;
}

export type RealtimeCallback = (payload: RealtimePostgresChangesPayload<any>) => void;

export interface LiveSearchResult {
  id: string;
  type: 'property' | 'user' | 'inquiry';
  title: string;
  description: string;
  relevance_score: number;
  updated_at: string;
}

export interface EnhancedNotification extends Notification {
  delivery_status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  delivery_method: 'push' | 'email' | 'sms' | 'in_app';
  retry_count: number;
  last_attempt: string;
  expires_at: string;
  action_required: boolean;
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ChatTypingIndicator {
  chat_room_id: string;
  user_id: string;
  user_name: string;
  is_typing: boolean;
  last_activity: string;
}

export interface ReadReceipt {
  message_id: string;
  user_id: string;
  read_at: string;
  delivery_method: string;
}

export interface RealtimePerformanceMetrics {
  active_subscriptions: number;
  message_rate: number;
  connection_health: 'excellent' | 'good' | 'fair' | 'poor';
  last_heartbeat: string;
  error_rate: number;
  avg_response_time: number;
}

export class RealtimeService {
  private static instance: RealtimeService;
  private supabase: typeof supabase;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private callbacks: Map<string, RealtimeCallback[]> = new Map();
  private messageCounts: Array<{ timestamp: number; count: number }> = [];
  private errorCounts: Array<{ timestamp: number; count: number }> = [];
  private responseTimes: number[] = [];
  private lastHeartbeat: Date = new Date();

  private constructor() {
    this.supabase = supabase;
  }

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToTable(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: RealtimeCallback,
    filters?: Record<string, any>
  ): string {
    const subscriptionId = `${table}_${event}_${Date.now()}`;
    
    const channel = this.supabase
      .channel(subscriptionId)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          filter: filters ? this.buildFilterString(filters) : undefined
        },
        callback
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      type: `${table}_${event}`,
      filters
    };

    this.subscriptions.set(subscriptionId, subscription);
    
    if (!this.callbacks.has(subscriptionId)) {
      this.callbacks.set(subscriptionId, []);
    }
    this.callbacks.get(subscriptionId)!.push(callback);

    return subscriptionId;
  }

  /**
   * Subscribe to specific user's data changes
   */
  subscribeToUserData(
    userId: string,
    callback: RealtimeCallback
  ): string {
    return this.subscribeToTable(
      'notifications',
      '*',
      callback,
      { user_id: `eq.${userId}` }
    );
  }

  /**
   * Subscribe to property updates
   */
  subscribeToPropertyUpdates(
    propertyId?: string,
    callback?: RealtimeCallback
  ): string {
    const filters = propertyId ? { id: `eq.${propertyId}` } : undefined;
    const defaultCallback: RealtimeCallback = (payload) => {
      console.log('Property update:', payload);
      // Emit custom event for property updates
      window.dispatchEvent(new CustomEvent('property-update', { detail: payload }));
    };

    return this.subscribeToTable(
      'properties',
      'UPDATE',
      callback || defaultCallback,
      filters
    );
  }

  /**
   * Subscribe to new inquiries
   */
  subscribeToNewInquiries(
    sellerId?: string,
    callback?: RealtimeCallback
  ): string {
    const filters = sellerId ? { seller_id: `eq.${sellerId}` } : undefined;
    const defaultCallback: RealtimeCallback = (payload) => {
      console.log('New inquiry:', payload);
      window.dispatchEvent(new CustomEvent('new-inquiry', { detail: payload }));
    };

    return this.subscribeToTable(
      'inquiries',
      'INSERT',
      callback || defaultCallback,
      filters
    );
  }

  /**
   * Subscribe to chat messages
   */
  subscribeToChatMessages(
    chatRoomId?: string,
    callback?: RealtimeCallback
  ): string {
    const filters = chatRoomId ? { chat_room_id: `eq.${chatRoomId}` } : undefined;
    const defaultCallback: RealtimeCallback = (payload) => {
      console.log('New chat message:', payload);
      window.dispatchEvent(new CustomEvent('new-chat-message', { detail: payload }));
    };

    return this.subscribeToTable(
      'chat_messages',
      'INSERT',
      callback || defaultCallback,
      filters
    );
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(
    userId?: string,
    callback?: RealtimeCallback
  ): string {
    const filters = userId ? { user_id: `eq.${userId}` } : undefined;
    const defaultCallback: RealtimeCallback = (payload) => {
      console.log('New notification:', payload);
      window.dispatchEvent(new CustomEvent('new-notification', { detail: payload }));
    };

    return this.subscribeToTable(
      'notifications',
      'INSERT',
      callback || defaultCallback,
      filters
    );
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.channel.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      this.callbacks.delete(subscriptionId);
      return true;
    }
    return false;
  }

  /**
   * Unsubscribe from all updates
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.channel.unsubscribe();
    });
    this.subscriptions.clear();
    this.callbacks.clear();
  }

  /**
   * Get real-time dashboard updates
   */
  async getDashboardUpdates(
    lastUpdate?: string
  ): Promise<{ success: boolean; data: RealtimeDashboardUpdates }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_realtime_dashboard_updates', {
          p_user_id: user.id,
          p_last_update: lastUpdate
        });

      if (error) {
        throw new Error(`Failed to get dashboard updates: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting dashboard updates:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount(): Promise<{ success: boolean; data: { unread_count: number } }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_unread_notification_count', { p_user_id: user.id });

      if (error) {
        throw new Error(`Failed to get unread count: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<{ success: boolean; message: string; notification_id: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('mark_notification_read', {
          p_notification_id: notificationId,
          p_user_id: user.id
        });

      if (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Get real-time subscription status
   */
  async getSubscriptionStatus(): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_realtime_subscription_status', { p_user_id: user.id });

      if (error) {
        throw new Error(`Failed to get subscription status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates
   */
  async subscribeToUpdates(
    subscriptionType: string,
    filters?: Record<string, any>
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('subscribe_to_realtime_updates', {
          p_user_id: user.id,
          p_subscription_type: subscriptionType,
          p_filters: filters || '{}'
        });

      if (error) {
        throw new Error(`Failed to subscribe to updates: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error subscribing to updates:', error);
      throw error;
    }
  }

  /**
   * Get live property search results
   */
  async livePropertySearch(
    searchParams: {
      search_query?: string;
      property_type?: string;
      listing_type?: string;
      min_price?: number;
      max_price?: number;
      city?: string;
      region?: string;
      bedrooms?: number;
      bathrooms?: number;
      min_square_feet?: number;
      max_square_feet?: number;
      features?: string[];
      amenities?: string[];
      sort_by?: string;
      sort_order?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ success: boolean; data: any; pagination: any; search_metadata: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('live_property_search', {
          p_search_query: searchParams.search_query,
          p_property_type: searchParams.property_type,
          p_listing_type: searchParams.listing_type,
          p_min_price: searchParams.min_price,
          p_max_price: searchParams.max_price,
          p_city: searchParams.city,
          p_region: searchParams.region,
          p_bedrooms: searchParams.bedrooms,
          p_bathrooms: searchParams.bathrooms,
          p_min_square_feet: searchParams.min_square_feet,
          p_max_square_feet: searchParams.max_square_feet,
          p_features: searchParams.features,
          p_amenities: searchParams.amenities,
          p_sort_by: searchParams.sort_by || 'created_at',
          p_sort_order: searchParams.sort_order || 'DESC',
          p_limit: searchParams.limit || 20,
          p_offset: searchParams.offset || 0
        });

      if (error) {
        throw new Error(`Failed to perform live search: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error performing live search:', error);
      throw error;
    }
  }

  /**
   * Get live property updates
   */
  async getLivePropertyUpdates(
    lastUpdate?: string,
    limit: number = 50
  ): Promise<{ success: boolean; data: any; metadata: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_live_property_updates', {
          p_last_update: lastUpdate,
          p_limit: limit
        });

      if (error) {
        throw new Error(`Failed to get live property updates: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting live property updates:', error);
      throw error;
    }
  }

  /**
   * Get live market insights
   */
  async getLiveMarketInsights(
    city?: string,
    propertyType?: string
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_live_market_insights', {
          p_city: city,
          p_property_type: propertyType
        });

      if (error) {
        throw new Error(`Failed to get market insights: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting market insights:', error);
      throw error;
    }
  }

  /**
   * Build filter string for real-time subscriptions
   */
  private buildFilterString(filters: Record<string, any>): string {
    const filterParts: string[] = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          filterParts.push(`${key}=eq.${value}`);
        } else if (typeof value === 'number') {
          filterParts.push(`${key}=eq.${value}`);
        } else if (typeof value === 'boolean') {
          filterParts.push(`${key}=eq.${value}`);
        }
      }
    });
    
    return filterParts.join('&');
  }

  /**
   * Subscribe to live search results with real-time updates
   */
  subscribeToLiveSearch(
    query: string,
    filters: Record<string, any> = {},
    callback: (results: LiveSearchResult[]) => void
  ): string {
    const subscriptionId = `live-search_${Date.now()}`;
    
    // Create a channel for live search
    const channel = this.supabase
      .channel(subscriptionId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'properties',
        filter: this.buildSearchFilter(query, filters)
      }, (payload) => {
        // Re-run search when data changes
        this.performLiveSearch(query, filters, callback);
      });

    // Perform initial search
    this.performLiveSearch(query, filters, callback);
    
    // Store subscription
    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      channel,
      type: 'live_search',
      filters: { query, ...filters }
    });

    return subscriptionId;
  }

  /**
   * Subscribe to enhanced notifications with delivery tracking
   */
  subscribeToEnhancedNotifications(
    userId: string,
    callback: (notification: EnhancedNotification) => void
  ): string {
    const subscriptionId = `enhanced-notifications_${Date.now()}`;
    
    const channel = this.supabase
      .channel(subscriptionId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, async (payload) => {
        const notification = payload.new as EnhancedNotification;
        
        // Track delivery status
        await this.trackNotificationDelivery(notification.id, 'pending');
        
        // Attempt delivery
        await this.deliverNotification(notification);
        
        callback(notification);
      });

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      channel,
      type: 'enhanced_notifications',
      filters: { user_id: userId }
    });

    return subscriptionId;
  }

  /**
   * Subscribe to chat typing indicators
   */
  subscribeToTypingIndicators(
    chatRoomId: string,
    callback: (typingData: ChatTypingIndicator) => void
  ): string {
    const subscriptionId = `typing-indicators_${Date.now()}`;
    
    const channel = this.supabase
      .channel(subscriptionId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_typing_indicators',
        filter: `chat_room_id=eq.${chatRoomId}`
      }, (payload) => {
        callback(payload.new as ChatTypingIndicator);
      });

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      channel,
      type: 'typing_indicators',
      filters: { chat_room_id: chatRoomId }
    });

    return subscriptionId;
  }

  /**
   * Subscribe to read receipts
   */
  subscribeToReadReceipts(
    messageId: string,
    callback: (receipt: ReadReceipt) => void
  ): string {
    const subscriptionId = `read-receipts_${Date.now()}`;
    
    const channel = this.supabase
      .channel(subscriptionId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'read_receipts',
        filter: `message_id=eq.${messageId}`
      }, (payload) => {
        callback(payload.new as ReadReceipt);
      });

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      channel,
      type: 'read_receipts',
      filters: { message_id: messageId }
    });

    return subscriptionId;
  }

  /**
   * Subscribe to real-time dashboard updates
   */
  subscribeToDashboardUpdates(
    userId: string,
    userRole: string,
    callback: (updates: RealtimeDashboardUpdates) => void
  ): string {
    const subscriptionId = `dashboard-updates_${Date.now()}`;
    
    // Create multiple subscriptions for different data types
    const channels: RealtimeChannel[] = [];
    
    // Properties updates
    if (userRole === 'seller') {
      const propertiesChannel = this.supabase
        .channel(`dashboard-properties-${subscriptionId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'properties',
          filter: `seller_id=eq.${userId}`
        }, () => this.aggregateDashboardUpdates(userId, userRole, callback));
      
      channels.push(propertiesChannel);
    }

    // Inquiries updates
    if (userRole === 'seller') {
      const inquiriesChannel = this.supabase
        .channel(`dashboard-inquiries-${subscriptionId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'property_inquiries',
          filter: `seller_id=eq.${userId}`
        }, () => this.aggregateDashboardUpdates(userId, userRole, callback));
      
      channels.push(inquiriesChannel);
    }

    // Notifications
    const notificationsChannel = this.supabase
      .channel(`dashboard-notifications-${subscriptionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, () => this.aggregateDashboardUpdates(userId, userRole, callback));
    
    channels.push(notificationsChannel);

    // Store subscription with multiple channels
    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      channel: channels[0], // Store first channel as primary
      type: 'dashboard_updates',
      filters: { user_id: userId, role: userRole }
    });

    // Subscribe to all channels
    channels.forEach(channel => channel.subscribe());

    return subscriptionId;
  }

  /**
   * Get real-time performance metrics
   */
  getPerformanceMetrics(): RealtimePerformanceMetrics {
    const activeSubs = this.subscriptions.size;
    const now = new Date();
    
    // Calculate message rate (messages per minute)
    const recentMessages = this.messageCounts.filter(
      (count: { timestamp: number; count: number }) => now.getTime() - count.timestamp < 60000
    );
    const messageRate = recentMessages.reduce((sum: number, count: { timestamp: number; count: number }) => sum + count.count, 0);

    // Calculate error rate
    const recentErrors = this.errorCounts.filter(
      (count: { timestamp: number; count: number }) => now.getTime() - count.timestamp < 60000
    );
    const errorRate = recentErrors.length / Math.max(activeSubs, 1);

    // Determine connection health
    let connectionHealth: RealtimePerformanceMetrics['connection_health'] = 'excellent';
    if (errorRate > 0.1) connectionHealth = 'poor';
    else if (errorRate > 0.05) connectionHealth = 'fair';
    else if (errorRate > 0.01) connectionHealth = 'good';

    return {
      active_subscriptions: activeSubs,
      message_rate: messageRate,
      connection_health: connectionHealth,
      last_heartbeat: this.lastHeartbeat.toISOString(),
      error_rate: errorRate,
      avg_response_time: this.calculateAverageResponseTime()
    };
  }

  /**
   * Optimize subscriptions for performance
   */
  optimizeSubscriptions(): void {
    const metrics = this.getPerformanceMetrics();
    
    // If too many active subscriptions, consolidate similar ones
    if (metrics.active_subscriptions > 50) {
      this.consolidateSimilarSubscriptions();
    }

    // If error rate is high, reconnect problematic channels
    if (metrics.error_rate > 0.1) {
      this.reconnectProblematicChannels();
    }

    // Clean up stale subscriptions
    this.cleanupStaleSubscriptions();
  }

  // Private helper methods
  private async performLiveSearch(
    query: string,
    filters: Record<string, any>,
    callback: (results: LiveSearchResult[]) => void
  ): Promise<void> {
    try {
      // Build search query
      let searchQuery = this.supabase
        .from('properties')
        .select('id, title, description, updated_at, property_type, city')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          searchQuery = searchQuery.eq(key, value);
        }
      });

      const { data, error } = await searchQuery.limit(20);

      if (error) throw error;

      // Convert to search results with relevance scoring
      const results: LiveSearchResult[] = (data || []).map(item => ({
        id: item.id,
        type: 'property',
        title: item.title,
        description: item.description,
        relevance_score: this.calculateRelevanceScore(query, item),
        updated_at: item.updated_at
      }));

      // Sort by relevance
      results.sort((a, b) => b.relevance_score - a.relevance_score);

      callback(results);
    } catch (error) {
      console.error('Live search error:', error);
    }
  }

  private buildSearchFilter(query: string, filters: Record<string, any>): string {
    let filterString = '';
    
    if (query) {
      filterString += `or(title.ilike.%${query}%,description.ilike.%${query}%)`;
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filterString += `and(${key}.eq.${value})`;
      }
    });

    return filterString;
  }

  private calculateRelevanceScore(query: string, item: any): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Title relevance (highest weight)
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 10;
      if (item.title.toLowerCase().startsWith(queryLower)) score += 5;
    }
    
    // Description relevance
    if (item.description.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // Recency bonus
    const daysSinceUpdate = (Date.now() - new Date(item.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 1) score += 3;
    else if (daysSinceUpdate < 7) score += 2;
    else if (daysSinceUpdate < 30) score += 1;
    
    return score;
  }

  private async trackNotificationDelivery(
    notificationId: string,
    status: EnhancedNotification['delivery_status']
  ): Promise<void> {
    try {
      await this.supabase
        .from('notifications')
        .update({ delivery_status: status, updated_at: new Date().toISOString() })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error tracking notification delivery:', error);
    }
  }

  private async deliverNotification(notification: EnhancedNotification): Promise<void> {
    try {
      // Attempt delivery based on method
      switch (notification.delivery_method) {
        case 'push':
          await this.deliverPushNotification(notification);
          break;
        case 'email':
          await this.deliverEmailNotification(notification);
          break;
        case 'sms':
          await this.deliverSMSNotification(notification);
          break;
        case 'in_app':
          await this.deliverInAppNotification(notification);
          break;
      }
      
      await this.trackNotificationDelivery(notification.id, 'delivered');
    } catch (error) {
      console.error('Error delivering notification:', error);
      await this.trackNotificationDelivery(notification.id, 'failed');
    }
  }

  private async deliverPushNotification(notification: EnhancedNotification): Promise<void> {
    // Implementation for push notifications
    console.log('Delivering push notification:', notification.id);
  }

  private async deliverEmailNotification(notification: EnhancedNotification): Promise<void> {
    // Implementation for email notifications
    console.log('Delivering email notification:', notification.id);
  }

  private async deliverSMSNotification(notification: EnhancedNotification): Promise<void> {
    // Implementation for SMS notifications
    console.log('Delivering SMS notification:', notification.id);
  }

  private async deliverInAppNotification(notification: EnhancedNotification): Promise<void> {
    // Implementation for in-app notifications
    console.log('Delivering in-app notification:', notification.id);
  }

  private async aggregateDashboardUpdates(
    userId: string,
    userRole: string,
    callback: (updates: RealtimeDashboardUpdates) => void
  ): Promise<void> {
    try {
      const updates: RealtimeDashboardUpdates = {
        notifications: [],
        property_updates: [],
        new_inquiries: [],
        chat_updates: []
      };

      // Get recent notifications
      const { data: notifications } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notifications) {
        updates.notifications = notifications;
      }

      // Get property updates for sellers
      if (userRole === 'seller') {
        const { data: properties } = await this.supabase
          .from('properties')
          .select('id, title, updated_at, price, property_type, city, is_featured, views_count')
          .eq('seller_id', userId)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (properties) {
          updates.property_updates = properties.map(p => ({
            id: p.id,
            title: p.title,
            update_type: 'modified',
            updated_at: p.updated_at,
            price: p.price,
            property_type: p.property_type,
            city: p.city,
            is_featured: p.is_featured,
            views_count: p.views_count
          }));
        }

        // Get new inquiries with property details
        const { data: inquiries } = await this.supabase
          .from('property_inquiries')
          .select(`
            id,
            buyer_name,
            buyer_email,
            created_at,
            property_id,
            properties!inner(id, title)
          `)
          .eq('seller_id', userId)
          .eq('status', 'new')
          .order('created_at', { ascending: false })
          .limit(5);

        if (inquiries) {
          updates.new_inquiries = inquiries.map(i => ({
            id: i.id,
            property_title: i.properties && i.properties.length > 0 ? i.properties[0].title : 'Unknown Property',
            buyer_name: i.buyer_name,
            buyer_email: i.buyer_email,
            created_at: i.created_at
          }));
        }
      }

      callback(updates);
    } catch (error) {
      console.error('Error aggregating dashboard updates:', error);
    }
  }

  private consolidateSimilarSubscriptions(): void {
    // Group subscriptions by type and filters
    const grouped = new Map<string, string[]>();
    
    this.subscriptions.forEach((sub, id) => {
      const key = `${sub.type}-${JSON.stringify(sub.filters)}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(id);
    });

    // Keep only one subscription per group, remove others
    grouped.forEach((ids, key) => {
      if (ids.length > 1) {
        // Keep the first one, remove the rest
        ids.slice(1).forEach(id => {
          this.unsubscribe(id);
        });
      }
    });
  }

  private reconnectProblematicChannels(): void {
    this.subscriptions.forEach((sub, id) => {
      if (sub.channel.state === 'closed' || sub.channel.state === 'errored') {
        console.log(`Reconnecting problematic channel: ${id}`);
        sub.channel.subscribe();
      }
    });
  }

  private cleanupStaleSubscriptions(): void {
    const now = Date.now();
    const staleThreshold = 30 * 60 * 1000; // 30 minutes
    
    this.subscriptions.forEach((sub, id) => {
      if (sub.lastActivity && (now - sub.lastActivity > staleThreshold)) {
        console.log(`Cleaning up stale subscription: ${id}`);
        this.unsubscribe(id);
      }
    });
  }

  private calculateAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    
    const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.responseTimes.length;
  }

  /**
   * Add event listener for real-time events
   */
  addEventListener(event: string, callback: EventListener): void {
    window.addEventListener(event, callback);
  }

  /**
   * Remove event listener for real-time events
   */
  removeEventListener(event: string, callback: EventListener): void {
    window.removeEventListener(event, callback);
  }

  /**
   * Emit custom event
   */
  emitEvent(event: string, data: any): void {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }
}

// Export singleton instance
export const realtimeService = RealtimeService.getInstance();
export default realtimeService;
