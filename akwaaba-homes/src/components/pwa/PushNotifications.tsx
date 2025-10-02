'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Settings } from 'lucide-react';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export function PushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true);
      updatePermissionStatus();
    }

    // Listen for permission changes
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName })
        .then((result) => {
          updatePermissionStatus();
          result.addEventListener('change', updatePermissionStatus);
        });
    }
  }, []);

  const updatePermissionStatus = () => {
    if ('Notification' in window) {
      setPermission({
        granted: Notification.permission === 'granted',
        denied: Notification.permission === 'denied',
        default: Notification.permission === 'default'
      });
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      updatePermissionStatus();
      
      if (result === 'granted') {
        // Subscribe to push notifications
        await subscribeToPushNotifications();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging is not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get push subscription
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe to push notifications
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });
        
        console.log('Push subscription created:', newSubscription);
        
        // Send subscription to server
        await sendSubscriptionToServer(newSubscription);
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: 'anonymous' // Replace with actual user ID
        })
      });

      if (response.ok) {
        console.log('Subscription sent to server successfully');
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!permission.granted) {
      await requestPermission();
      return;
    }

    try {
      // Send test notification
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'AkwaabaHomes',
          body: 'New properties matching your search!',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          data: {
            url: '/search'
          }
        })
      });

      if (response.ok) {
        console.log('Test notification sent');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Push Notifications
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get notified about new properties and updates
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {permission.granted && (
            <Button
              onClick={sendTestNotification}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Bell className="w-4 h-4 mr-1" />
              Test
            </Button>
          )}
          
          <Button
            onClick={requestPermission}
            size="sm"
            variant={permission.granted ? "outline" : "default"}
            disabled={permission.denied}
            className="text-xs"
          >
            {permission.granted ? (
              <>
                <Bell className="w-4 h-4 mr-1" />
                Enabled
              </>
            ) : permission.denied ? (
              <>
                <BellOff className="w-4 h-4 mr-1" />
                Blocked
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-1" />
                Enable
              </>
            )}
          </Button>
        </div>
      </div>

      {permission.denied && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Notifications are blocked. Please enable them in your browser settings to receive property alerts.
          </p>
        </div>
      )}

      {permission.granted && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ You'll receive notifications about new properties and important updates.
          </p>
        </div>
      )}
    </div>
  );
}

// Hook for managing push notifications
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      updatePermissionStatus();
    }
  }, []);

  const updatePermissionStatus = () => {
    if ('Notification' in window) {
      setPermission({
        granted: Notification.permission === 'granted',
        denied: Notification.permission === 'denied',
        default: Notification.permission === 'default'
      });
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    
    const result = await Notification.requestPermission();
    updatePermissionStatus();
    return result === 'granted';
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission.granted) {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
    }
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification
  };
}




