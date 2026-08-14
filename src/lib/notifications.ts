/**
 * Push Notification utilities for Mama's Kitchen
 * Handles subscription, unsubscription, and permission management
 */

const SW_PATH = '/sw.js';

export async function isPushSupported(): Promise<boolean> {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  return Notification.requestPermission();
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: '/',
    });
    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
  applicationServerKey: string
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    });

    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      // Notify server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });
    }
    return true;
  } catch (error) {
    console.error('Push unsubscription failed:', error);
    return false;
  }
}

// Send a local notification (for order updates when no push server is configured)
export async function showLocalNotification({
  title,
  body,
  icon = '/logo.png',
  tag,
  url = '/',
}: {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
}): Promise<void> {
  if (!('Notification' in window)) return;

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  registration.showNotification(title, {
    body,
    icon,
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    tag,
    data: { url },
  });
}

// Order-specific notification helpers
export function notifyOrderStatus(status: string, orderNumber: string) {
  const titles: Record<string, string> = {
    CONFIRMED: 'Order Confirmed! 🎉',
    PREPARING: 'Your food is being prepared 👨‍🍳',
    READY: 'Your order is ready for pickup! ✅',
    OUT_FOR_DELIVERY: 'Your order is on the way! 🛵',
    DELIVERED: 'Order delivered! Enjoy your meal! 🍽️',
    CANCELLED: 'Order cancelled ❌',
  };

  const bodies: Record<string, string> = {
    CONFIRMED: 'We\'ve received your order and will start preparing it shortly.',
    PREPARING: 'The kitchen is working on your order. Stay hungry!',
    READY: 'Your order is packed and ready. Come pick it up or wait for delivery.',
    OUT_FOR_DELIVERY: 'Your rider is on the way. Get ready!',
    DELIVERED: 'Your order has been delivered. Thank you for choosing Mama\'s Kitchen!',
    CANCELLED: 'Your order has been cancelled. Please contact us if this was a mistake.',
  };

  return showLocalNotification({
    title: `Mama's Kitchen - ${titles[status] || 'Order Update'}`,
    body: `${bodies[status] || 'Your order has been updated.'} (Order ${orderNumber})`,
    tag: `order-${orderNumber}`,
    url: `/order/${orderNumber}`,
  });
}
