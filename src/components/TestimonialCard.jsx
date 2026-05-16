import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function TestimonialCard({ testimonial, index = 0 }) {
  return (
    <motion.div
      className="glass-card p-6 glass-card-hover min-w-[300px] flex-shrink-0"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 dark:border-purple-700"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-sm dark:text-white">{testimonial.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</p>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{testimonial.text}</p>
    </motion.div>
  );
}
