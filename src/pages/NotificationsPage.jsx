import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Ticket, Bookmark, Calendar, User, Settings, Clock, CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, clearNotifications } from '../lib/database';
import EmptyState from '../components/EmptyState';

const iconMap = {
  registration: Ticket,
  save: Bookmark,
  event: Calendar,
  profile: User,
  system: Settings,
  reminder_24h: CalendarCheck,
  reminder_1h: Clock,
};

const colorMap = {
  reminder_24h: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-500' },
  reminder_1h:  { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-500' },
  default:      { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-500' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleClearAll = async () => {
    await clearNotifications(user.id);
    setNotifications([]);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold dark:text-white">
            Notifications {unread > 0 && <span className="text-sm font-normal text-purple-500">({unread} unread)</span>}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Stay updated with your activity</p>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button onClick={handleMarkAllRead} className="px-3 py-2 text-xs font-medium glass-card flex items-center gap-1.5 hover:bg-white/40 dark:hover:bg-white/10 transition-all">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
            <button onClick={handleClearAll} className="px-3 py-2 text-xs font-medium text-red-500 glass-card flex items-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll see notifications here when something happens."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <motion.div
                key={notif.id}
                className={`glass-card p-4 flex items-start gap-4 transition-all ${!notif.is_read ? 'border-l-3 border-l-purple-500' : 'opacity-70'}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {(() => {
                  const c = colorMap[notif.type] || colorMap.default;
                  return (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.is_read ? c.bg : 'bg-gray-100 dark:bg-gray-800/30'}`}>
                      <Icon className={`w-5 h-5 ${!notif.is_read ? c.icon : 'text-gray-400'}`} />
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold dark:text-white">{notif.title}</p>
                  {notif.message && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.message}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                </div>
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex-shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4 text-purple-500" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
