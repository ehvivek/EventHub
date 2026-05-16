import { motion } from 'framer-motion';
import { LandingNavbar } from '../components/Navbar';
import FloatingParticles from '../components/FloatingParticles';
import DiscoverSection from '../components/DiscoverSection';

import bgLight from '../assets/backgrounds/bg_light.png';
import bgDark from '../assets/backgrounds/bg_dark.png';
import { useTheme } from '../context/ThemeContext';

export default function Discover() {
  const { isDark } = useTheme();

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="fixed inset-0 z-0">
        <img src={isDark ? bgDark : bgLight} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/30 dark:bg-black/40" />
      </div>

      <FloatingParticles />

      <div className="relative z-10">
        <LandingNavbar />
        <DiscoverSection />
      </div>
    </motion.div>
  );
}
