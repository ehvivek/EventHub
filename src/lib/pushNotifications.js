// =============================================
// EventHub Push Notification Utilities
// =============================================
// Handles service worker registration, permission requests,
// and showing OS-level browser notifications on desktop + mobile Chrome.

const ICON = '/src/assets/logos/eventhub_logo.png';
const SW_URL = '/sw.js';

/** Register the service worker (call once at app startup) */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_URL, { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('[EventHub SW] Registration failed:', err);
    return null;
  }
}

/**
 * Request notification permission from the browser.
 * Returns 'granted', 'denied', or 'default'.
 * Call this after a user gesture (e.g. after login).
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  const result = await Notification.requestPermission();
  return result;
}

/**
 * Show an OS-level browser notification.
 * Works on desktop Chrome and Android Chrome (notification bar).
 *
 * @param {string} title
 * @param {string} body
 * @param {{ tag?: string, url?: string }} options
 */
export async function showPushNotification(title, body, options = {}) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const tag = options.tag || 'eventhub-reminder';
  const targetUrl = options.url || '/notifications';

  // Prefer service worker notification (works when app is backgrounded on mobile)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: ICON,
        badge: ICON,
        tag,
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: targetUrl },
      });
      return;
    } catch (_) {}
  }

  // Fallback: plain Notification API (foreground only)
  const notif = new Notification(title, {
    body,
    icon: ICON,
    tag,
  });
  notif.onclick = () => {
    window.focus();
    window.location.href = targetUrl;
    notif.close();
  };
}
