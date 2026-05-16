import { motion } from 'framer-motion';
import { Bookmark, MapPin, CalendarDays } from 'lucide-react';

export default function RecommendedCard({ event, index = 0 }) {
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
      <div className="relative overflow-hidden h-40">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <button
          className="absolute top-3 right-3 p-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/40 transition-all"
          aria-label="Save event"
        >
          <Bookmark className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm dark:text-white line-clamp-2">{event.title}</h3>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>{event.location}</span>
        </div>
      </div>
    </motion.div>
  );
}
