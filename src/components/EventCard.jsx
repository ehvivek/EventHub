import { motion } from 'framer-motion';
import { Bookmark, Users } from 'lucide-react';

export default function EventCard({ event, index = 0 }) {
  return (
    <motion.div
      className="glass-card glass-card-hover overflow-hidden cursor-pointer group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-44">
        <img
          src={event.image || event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {event.featured && (
          <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-lg">
            Featured
          </span>
        )}
        <button
          className="absolute top-3 right-3 p-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/40 transition-all"
          aria-label="Save event"
        >
          <Bookmark className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center bg-purple-100 dark:bg-purple-900/30 rounded-lg px-2.5 py-1.5 min-w-[48px]">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">{event.month}</span>
            <span className="text-lg font-bold text-purple-700 dark:text-purple-300">{event.day}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate dark:text-white">{event.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.location}</p>
          </div>
        </div>

        {/* Attendees */}
        <div className="flex items-center mt-3 gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{event.attendees || 0} attending</span>
        </div>
      </div>
    </motion.div>
  );
}
