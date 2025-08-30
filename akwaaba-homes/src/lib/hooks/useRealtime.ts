import { useEffect, useRef, useCallback, useState } from 'react';
import { realtimeService, RealtimeCallback, RealtimeSubscription } from '@/lib/services/realtimeService';
import { useAuth } from '@/lib/auth/authContext';

// Import the new types from the realtime service
import type {
  LiveSearchResult,
  EnhancedNotification,
  ChatTypingIndicator,
  ReadReceipt,
  RealtimeDashboardUpdates,
  RealtimePerformanceMetrics
} from '@/lib/services/realtimeService';

export interface UseRealtimeOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface UseRealtimeReturn {
  isConnected: boolean;
  subscriptions: string[];
  subscribe: (table: string, event: 'INSERT' | 'UPDATE' | 'DELETE' | '*', callback: RealtimeCallback, filters?: Record<string, any>) => string;
  unsubscribe: (subscriptionId: string) => boolean;
  unsubscribeAll: () => void;
  error: Error | null;
}

/**
 * Hook for managing real-time subscriptions
 */
export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeReturn {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const subscriptionsRef = useRef<string[]>([]);
  const { enabled = true, onError, onConnect, onDisconnect } = options;

  // Subscribe to table changes
  const subscribe = useCallback((
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: RealtimeCallback,
    filters?: Record<string, any>
  ): string => {
    try {
      const subscriptionId = realtimeService.subscribeToTable(table, event, callback, filters);
      subscriptionsRef.current.push(subscriptionId);
      setIsConnected(true);
      onConnect?.();
      return subscriptionId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to subscribe');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [onError, onConnect]);

  // Unsubscribe from specific subscription
  const unsubscribe = useCallback((subscriptionId: string): boolean => {
    try {
      const success = realtimeService.unsubscribe(subscriptionId);
      if (success) {
        subscriptionsRef.current = subscriptionsRef.current.filter(id => id !== subscriptionId);
        if (subscriptionsRef.current.length === 0) {
          setIsConnected(false);
          onDisconnect?.();
        }
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to unsubscribe');
      setError(error);
      onError?.(error);
      return false;
    }
  }, [onError, onDisconnect]);

  // Unsubscribe from all subscriptions
  const unsubscribeAll = useCallback(() => {
    try {
      realtimeService.unsubscribeAll();
      subscriptionsRef.current = [];
      setIsConnected(false);
      onDisconnect?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to unsubscribe all');
      setError(error);
      onError?.(error);
    }
  }, [onError, onDisconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enabled) {
        unsubscribeAll();
      }
    };
  }, [enabled, unsubscribeAll]);

  return {
    isConnected,
    subscriptions: subscriptionsRef.current,
    subscribe,
    unsubscribe,
    unsubscribeAll,
    error
  };
}

/**
 * Hook for subscribing to property updates
 */
export function usePropertyUpdates(
  propertyId?: string,
  options: UseRealtimeOptions = {}
) {
  const { subscribe, unsubscribe, ...rest } = useRealtime(options);
  const [propertyUpdates, setPropertyUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!options.enabled) return;

    const subscriptionId = subscribe(
      'properties',
      'UPDATE',
      (payload) => {
        setPropertyUpdates(prev => [...prev, payload]);
      },
      propertyId ? { id: `eq.${propertyId}` } : undefined
    );

    return () => { unsubscribe(subscriptionId); };
  }, [propertyId, subscribe, unsubscribe, options.enabled]);

  return {
    ...rest,
    propertyUpdates,
    clearUpdates: () => setPropertyUpdates([])
  };
}

/**
 * Hook for subscribing to new inquiries
 */
export function useNewInquiries(
  sellerId?: string,
  options: UseRealtimeOptions = {}
) {
  const { subscribe, unsubscribe, ...rest } = useRealtime(options);
  const [newInquiries, setNewInquiries] = useState<any[]>([]);

  useEffect(() => {
    if (!options.enabled) return;

    const subscriptionId = subscribe(
      'inquiries',
      'INSERT',
      (payload) => {
        setNewInquiries(prev => [...prev, payload]);
      },
      sellerId ? { seller_id: `eq.${sellerId}` } : undefined
    );

    return () => { unsubscribe(subscriptionId); };
  }, [sellerId, subscribe, unsubscribe, options.enabled]);

  return {
    ...rest,
    newInquiries,
    clearInquiries: () => setNewInquiries([])
  };
}

/**
 * Hook for subscribing to notifications
 */
export function useNotifications(
  userId?: string,
  options: UseRealtimeOptions = {}
) {
  const { subscribe, unsubscribe, ...rest } = useRealtime(options);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!options.enabled) return;

    const subscriptionId = subscribe(
      'notifications',
      'INSERT',
      (payload) => {
        setNotifications(prev => [...prev, payload]);
      },
      userId ? { user_id: `eq.${userId}` } : undefined
    );

    return () => { unsubscribe(subscriptionId); };
  }, [userId, subscribe, unsubscribe, options.enabled]);

  return {
    ...rest,
    notifications,
    clearNotifications: () => setNotifications([])
  };
}

/**
 * Hook for subscribing to chat messages
 */
export function useChatMessages(
  chatRoomId?: string,
  options: UseRealtimeOptions = {}
) {
  const { subscribe, unsubscribe, ...rest } = useRealtime(options);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!options.enabled) return;

    const subscriptionId = subscribe(
      'chat_messages',
      'INSERT',
      (payload) => {
        setChatMessages(prev => [...prev, payload]);
      },
      chatRoomId ? { chat_room_id: `eq.${chatRoomId}` } : undefined
    );

    return () => { unsubscribe(subscriptionId); };
  }, [chatRoomId, subscribe, unsubscribe, options.enabled]);

  return {
    ...rest,
    chatMessages,
    clearMessages: () => setChatMessages([])
  };
}

/**
 * Hook for live search with real-time updates
 */
export function useLiveSearch(
  query: string,
  filters: Record<string, any> = {},
  options: UseRealtimeOptions = {}
) {
  const { subscribe, unsubscribe, ...rest } = useRealtime(options);
  const [searchResults, setSearchResults] = useState<LiveSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!options.enabled || !query.trim()) return;

    setIsSearching(true);
    const subscriptionId = subscribe(
      'live_search',
      'INSERT',
      (payload) => {
        // Re-run search when data changes
        // This will be handled by the realtime service
      },
      { query, ...filters }
    );

    return () => {
      void unsubscribe(subscriptionId);
    };
  }, [query, filters, subscribe, unsubscribe, options.enabled]);

  return {
    ...rest,
    searchResults,
    isSearching,
    clearResults: () => setSearchResults([])
  };
}

/**
 * Hook for enhanced notifications with delivery tracking
 */
export function useEnhancedNotifications(
  userId?: string,
  options: UseRealtimeOptions = {}
) {
  const { subscribe, unsubscribe, ...rest } = useRealtime(options);
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);

  useEffect(() => {
    if (!options.enabled || !userId) return;

    const subscriptionId = subscribe(
      'enhanced_notifications',
      'INSERT',
      (payload) => {
        const notification = payload.new as EnhancedNotification;
        setNotifications(prev => [notification, ...prev]);
      },
      { user_id: userId }
    );

    return () => {
      void unsubscribe(subscriptionId);
    };
  }, [userId, subscribe, unsubscribe, options.enabled]);

  return {
    ...rest,
    notifications,
    clearNotifications: () => setNotifications([]),
    markAsRead: (notificationId: string) => {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, delivery_status: 'read' as const } : n
        )
      );
    }
  };
}

/**
 * Hook for chat typing indicators
 */
export function useTypingIndicators(
  chatRoomId?: string,
  options: UseRealtimeOptions = {}
) {
  const { subscribe, unsubscribe, ...rest } = useRealtime(options);
  const [typingUsers, setTypingUsers] = useState<ChatTypingIndicator[]>([]);

  useEffect(() => {
    if (!options.enabled || !chatRoomId) return;

    const subscriptionId = subscribe(
      'typing_indicators',
      '*',
      (payload) => {
        const typingData = payload.new as ChatTypingIndicator;
        if (typingData.is_typing) {
          setTypingUsers(prev => [...prev.filter(u => u.user_id !== typingData.user_id), typingData]);
        } else {
          setTypingUsers(prev => prev.filter(u => u.user_id !== typingData.user_id));
        }
      },
      { chat_room_id: chatRoomId }
    );

    return () => {
      void unsubscribe(subscriptionId);
    };
  }, [chatRoomId, subscribe, unsubscribe, options.enabled]);

  return {
    ...rest,
    typingUsers,
    clearTypingUsers: () => setTypingUsers([])
  };
}

/**
 * Hook for read receipts
 */
export function useReadReceipts(
  messageId?: string,
  options: UseRealtimeOptions = {}
) {
  const { subscribe, unsubscribe, ...rest } = useRealtime(options);
  const [readReceipts, setReadReceipts] = useState<ReadReceipt[]>([]);

  useEffect(() => {
    if (!options.enabled || !messageId) return;

    const subscriptionId = subscribe(
      'read_receipts',
      'INSERT',
      (payload) => {
        const receipt = payload.new as ReadReceipt;
        setReadReceipts(prev => [...prev, receipt]);
      },
      { message_id: messageId }
    );

    return () => {
      void unsubscribe(subscriptionId);
    };
  }, [messageId, subscribe, unsubscribe, options.enabled]);

  return {
    ...rest,
    readReceipts,
    clearReceipts: () => setReadReceipts([])
  };
}

/**
 * Hook for real-time dashboard updates
 */
export function useDashboardUpdates(
  userId?: string,
  userRole?: string,
  options: UseRealtimeOptions = {}
) {
  const { subscribe, unsubscribe, ...rest } = useRealtime(options);
  const [dashboardUpdates, setDashboardUpdates] = useState<RealtimeDashboardUpdates>({
    notifications: [],
    property_updates: [],
    new_inquiries: [],
    chat_updates: []
  });

  useEffect(() => {
    if (!options.enabled || !userId || !userRole) return;

    const subscriptionId = subscribe(
      'dashboard_updates',
      '*',
      (payload) => {
        // The realtime service will aggregate updates and call the callback
        // This is handled by the service layer
      },
      { user_id: userId, role: userRole }
    );

    return () => {
      void unsubscribe(subscriptionId);
    };
  }, [userId, userRole, subscribe, unsubscribe, options.enabled]);

  return {
    ...rest,
    dashboardUpdates,
    clearUpdates: () => setDashboardUpdates({
      notifications: [],
      property_updates: [],
      new_inquiries: [],
      chat_updates: []
    })
  };
}

/**
 * Hook for real-time performance metrics
 */
export function useRealtimePerformance(options: UseRealtimeOptions = {}) {
  const [metrics, setMetrics] = useState<RealtimePerformanceMetrics | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const getMetrics = useCallback(() => {
    if (realtimeService.getPerformanceMetrics) {
      const currentMetrics = realtimeService.getPerformanceMetrics();
      setMetrics(currentMetrics);
      return currentMetrics;
    }
    return null;
  }, []);

  const optimizeSubscriptions = useCallback(() => {
    if (realtimeService.optimizeSubscriptions) {
      setIsOptimizing(true);
      realtimeService.optimizeSubscriptions();
      setIsOptimizing(false);
      // Refresh metrics after optimization
      getMetrics();
    }
  }, [getMetrics]);

  useEffect(() => {
    if (!options.enabled) return;

    // Get initial metrics
    getMetrics();

    // Set up interval to refresh metrics
    const interval = setInterval(getMetrics, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [options.enabled, getMetrics]);

  return {
    metrics,
    isOptimizing,
    getMetrics,
    optimizeSubscriptions,
    refreshMetrics: getMetrics
  };
}
