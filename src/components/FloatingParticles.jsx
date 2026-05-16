import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import bubblesLight from '../assets/effects/bubbles_light.png';
import bubblesDark from '../assets/effects/bubbles_dark.png';

export default function FloatingParticles() {
  const { isDark } = useTheme();

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Background overlay image */}
      <motion.img
        src={isDark ? bubblesDark : bubblesLight}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      />

      {/* Animated CSS particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: isDark
              ? `radial-gradient(circle, rgba(139,92,246,${p.opacity}) 0%, transparent 70%)`
              : `radial-gradient(circle, rgba(196,167,255,${p.opacity + 0.1}) 0%, transparent 70%)`,
            filter: `blur(${p.size / 8}px)`,
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
