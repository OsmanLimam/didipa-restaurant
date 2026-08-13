/// <reference lib="webworker" />

// DidiPa Push Notification Service Worker
// Handles push notifications for order status updates

const NOTIFICATION_ICONS: Record<string, string> = {
  confirmed: '/logo.png',
  preparing: '/logo.png',
  ready: '/logo.png',
  delivered: '/logo.png',
};

const NOTIFICATION_TITLES: Record<string, string> = {
  confirmed: 'Order Confirmed!',
  preparing: 'Your food is being prepared',
  ready: 'Your order is ready!',
  out_for_delivery: 'Your order is on the way!',
  delivered: 'Order delivered! Enjoy your meal!',
  cancelled: 'Order cancelled',
};

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() || {};
  const status = data.status || 'confirmed';
  const orderNumber = data.orderNumber || '';
  const message = data.message || NOTIFICATION_TITLES[status] || 'Order update';

  const title = `DidiPa - ${NOTIFICATION_TITLES[status] || 'Order Update'}`;
  const options: NotificationOptions = {
    body: message + (orderNumber ? ` (Order ${orderNumber})` : ''),
    icon: NOTIFICATION_ICONS[status] || '/logo.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      status,
      orderNumber,
    },
    actions: status === 'ready'
      ? [{ action: 'track', title: 'Track Order' }]
      : status === 'delivered'
        ? [{ action: 'reorder', title: 'Order Again' }]
        : [],
    tag: `order-${orderNumber}`, // Prevent duplicate notifications
    requireInteraction: status === 'ready', // Keep visible until dismissed for "ready" status
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = data.url || '/';

  if (event.action === 'track' && data.orderNumber) {
    url = `/order/${data.orderNumber}`;
  } else if (event.action === 'reorder') {
    url = '/menu';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url);
    })
  );
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  // Re-subscribe with the same options
  event.waitUntil(
    self.registration.pushManager.getSubscription().then((subscription) => {
      if (subscription) {
        // Send new subscription to server
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      }
    })
  );
});
