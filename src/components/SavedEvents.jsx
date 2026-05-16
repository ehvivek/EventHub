import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { featuredEvents } from '../data/mockEvents';

export default function SavedEvents() {
  const saved = featuredEvents.slice(0, 4);

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm dark:text-white">Saved Events</h3>
        <button className="text-xs text-purple-500 hover:text-purple-600 font-medium">View all</button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {saved.slice(0, 3).map((event) => (
          <div key={event.id} className="relative overflow-hidden rounded-xl group cursor-pointer">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-20 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <button className="absolute top-1 right-1 p-1 rounded-md bg-white/20 backdrop-blur-md">
              <Bookmark className="w-3 h-3 text-white fill-white" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
