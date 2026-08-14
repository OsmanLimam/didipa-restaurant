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
    tag: `order-${orderNumber}`,
    requireInteraction: status === 'ready',
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
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.getSubscription().then((subscription) => {
      if (subscription) {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      }
    })
  );
});
