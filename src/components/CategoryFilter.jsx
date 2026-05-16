import { motion } from 'framer-motion';
import { useState } from 'react';
import { Monitor, Music, Rocket, Gamepad2, Wrench, Palette, Briefcase, LayoutGrid } from 'lucide-react';

const categories = [
  { name: 'All', icon: LayoutGrid },
  { name: 'Tech', icon: Monitor },
  { name: 'Music', icon: Music },
  { name: 'Startup', icon: Rocket },
  { name: 'Gaming', icon: Gamepad2 },
  { name: 'Workshops', icon: Wrench },
  { name: 'Design', icon: Palette },
  { name: 'Business', icon: Briefcase },
];

export default function CategoryFilter() {
  const [active, setActive] = useState('All');

  return (
    <motion.div
      className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mt-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.name}
            onClick={() => setActive(cat.name)}
            className={`flex-shrink-0 flex items-center gap-1.5 ${
              active === cat.name ? 'category-pill-active' : 'category-pill'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </motion.div>
  );
}
