import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock, CheckCircle, Home, LayoutDashboard, ArrowRight, Lock, Plus, Activity, Rocket, Zap, BarChart2 } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getCountdownLabel(event) {
  // If vault event is explicitly marked completed, always show Completed
  if (event.status === 'completed') {
    return { label: 'Completed', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.start_date);
  eventDate.setHours(0, 0, 0, 0);
  const diffMs = eventDate - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Completed', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' };
  if (diffDays === 0) return { label: 'Today', color: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400' };
  if (diffDays === 1) return { label: 'Tomorrow', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' };
  if (diffDays <= 7) return { label: `In ${diffDays} Days`, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' };
  return { label: `In ${diffDays} Days`, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' };
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function ChronoTimeline({ events }) {
  const now = new Date();

  // An event is considered completed if it has status === 'completed' OR its date has passed
  const isCompleted = (e) => e.status === 'completed' || new Date(e.start_date) < new Date(now.toDateString());

  const upcoming = events
    .filter(e => !isCompleted(e))
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  const completed = events
    .filter(e => isCompleted(e))
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  const totalEvents = events.length;
  const todayCount = events.filter(e => {
    const evDate = new Date(e.start_date);
    return evDate.getDate() === now.getDate() && evDate.getMonth() === now.getMonth() && evDate.getFullYear() === now.getFullYear();
  }).length;

  const renderTimelineItem = (event, index, isCompleted) => {
    const countdown = getCountdownLabel(event);
    const isVault = event._source === 'vault';

    return (
      <motion.div
        key={event._uniqueId || event.id}
        className="flex gap-3 group"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        {/* Timeline dot + line */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className={`w-3 h-3 rounded-full mt-1.5 ring-4 ${
            isCompleted
              ? 'bg-green-500 ring-green-500/20'
              : 'bg-purple-500 ring-purple-500/20'
          }`} />
          <div className="w-px flex-1 bg-gradient-to-b from-purple-500/20 to-transparent min-h-[40px]" />
        </div>

        {/* Event card */}
        <div className="flex-1 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                {isVault && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-bold text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30 rounded-full uppercase tracking-wider">
                    <Lock className="w-2 h-2" /> Vault
                  </span>
                )}
                <h4 className="text-sm font-semibold dark:text-white truncate group-hover:text-purple-500 transition-colors">
                  {event.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatDate(event.start_date)}, {formatTime(event.start_date)}</span>
                </div>
              </div>
              {event.location && (
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                  <MapPin className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[140px]">{event.location}</span>
                </div>
              )}
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${countdown.color}`}>
              {countdown.label}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Event Timeline */}
      <motion.div
        className="glass-card p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-bold dark:text-white">Event Timeline</h3>
          </div>
        </div>

        <div className="max-h-[450px] overflow-y-auto pr-2 space-y-1 timeline-scrollbar">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-purple-500 dark:text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-4 h-px bg-purple-500/30" />
                Upcoming
              </p>
              {upcoming.map((e, i) => renderTimelineItem(e, i, false))}
            </>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-green-500 dark:text-green-400 uppercase tracking-widest mb-3 mt-2 flex items-center gap-1.5">
                <span className="w-4 h-px bg-green-500/30" />
                Completed
              </p>
              {completed.map((e, i) => renderTimelineItem(e, i, true))}
            </>
          )}

          {upcoming.length === 0 && completed.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-500">No events found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Records Section */}
      <motion.div
        className="glass-card p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-pink-500" />
            <h3 className="font-display text-sm font-bold dark:text-white uppercase tracking-wider">Records</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Activity, label: 'Total Joined', value: totalEvents, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/20' },
            { icon: Rocket, label: 'Upcoming', value: upcoming.length, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/20' },
            { icon: CheckCircle, label: 'Completed', value: completed.length, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-500/20' },
            { icon: Zap, label: 'Today', value: todayCount, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500/20' },
          ].map((stat, idx) => (
            <div key={idx} className="group glass-card p-3 glass-card-hover flex flex-col gap-2 relative overflow-hidden">
              <div className={`absolute -right-6 -top-6 w-16 h-16 rounded-full ${stat.bg} blur-2xl group-hover:scale-150 transition-transform duration-500`} />
              <div className="flex items-center gap-1.5 relative z-10">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold dark:text-white relative z-10 font-display pl-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
