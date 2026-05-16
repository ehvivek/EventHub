import { useEffect, useRef } from 'react';
import { checkAndSendReminders } from '../lib/database';
import { showPushNotification } from '../lib/pushNotifications';

/**
 * useReminderCheck
 * Silently runs checkAndSendReminders on mount (user login) and then
 * every 30 minutes while the user remains in the dashboard.
 * For each newly created reminder it also fires a real OS-level
 * browser push notification (visible in Android/desktop notification bar).
 */
export function useReminderCheck(userId) {
  const intervalRef = useRef(null);

  const runCheck = async () => {
    if (!userId) return;
    try {
      const fired = await checkAndSendReminders(userId);
      // Fire an OS notification for each newly created reminder
      for (const { title, message, tag } of fired || []) {
        await showPushNotification(title, message, { tag, url: '/notifications' });
      }
    } catch (_) {
      // Silent fail — reminders are non-critical
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Run immediately on mount
    runCheck();

    // Re-check every 30 minutes (catches 1h window reliably)
    intervalRef.current = setInterval(runCheck, 30 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId]);
}

