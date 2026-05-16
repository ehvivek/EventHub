import { motion } from 'framer-motion';
import { upcomingEvents } from '../data/mockEvents';

export default function UpcomingEvents() {
  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm dark:text-white">Upcoming Events</h3>
        <button className="text-xs text-purple-500 hover:text-purple-600 font-medium">View all</button>
      </div>

      <div className="space-y-4">
        {upcomingEvents.map((event, i) => (
          <div key={event.id} className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: event.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{event.date}</span>
              </div>
              <p className="text-sm font-semibold dark:text-white truncate">{event.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{event.location}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
