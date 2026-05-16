import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center gap-2 p-1 rounded-full transition-all duration-300 ${
        isDark
          ? 'bg-indigo-900/50 border border-indigo-500/30'
          : 'bg-purple-100/60 border border-purple-200/50'
      } ${className}`}
      aria-label="Toggle theme"
      id="theme-toggle"
    >
      <motion.div
        className={`flex items-center justify-center w-8 h-8 rounded-full ${
          !isDark ? 'bg-white shadow-md' : ''
        }`}
        whileTap={{ scale: 0.9 }}
      >
        <Sun className={`w-4 h-4 ${!isDark ? 'text-amber-500' : 'text-gray-400'}`} />
      </motion.div>
      <motion.div
        className={`flex items-center justify-center w-8 h-8 rounded-full ${
          isDark ? 'bg-indigo-600 shadow-md' : ''
        }`}
        whileTap={{ scale: 0.9 }}
      >
        <Moon className={`w-4 h-4 ${isDark ? 'text-white' : 'text-gray-400'}`} />
      </motion.div>
    </button>
  );
}
