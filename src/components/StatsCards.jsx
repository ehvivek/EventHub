import { motion } from 'framer-motion';
import { ClipboardList, Heart, Ticket } from 'lucide-react';

const stats = [
  { label: 'Registered Events', value: 12, icon: ClipboardList, color: 'text-blue-500' },
  { label: 'Saved Events', value: 4, icon: Heart, color: 'text-pink-500' },
  { label: 'Tickets', value: 2, icon: Ticket, color: 'text-amber-500' },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            className="glass-card p-4 flex items-center gap-3 glass-card-hover"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-xl font-bold dark:text-white">{stat.value}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
