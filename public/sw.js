// =============================================
// EventHub Service Worker
// Handles background push notification events
// =============================================

const ICON = '/src/assets/logos/eventhub_logo.png';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle push events sent from the server (future use with VAPID)
self.addEventListener('push', (event) => {
  let data = { title: 'EventHub', body: 'You have a new notification.' };

  try {
    data = event.data.json();
  } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: ICON,
      badge: ICON,
      tag: data.tag || 'eventhub-notif',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url || '/notifications' },
    })
  );
});

// When user taps the notification, open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
