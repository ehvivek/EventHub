import { motion } from 'framer-motion';
import { Sparkles, Rocket, Users, Zap } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const features = [
  {
    icon: Rocket,
    title: 'Easy Event Creation',
    description: 'Create and manage events effortlessly with interactive dashboards, live previews, and seamless publishing tools.',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    icon: Users,
    title: 'Discover Communities',
    description: 'Explore events, connect with people, and join communities that match your interests and passions.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Zap,
    title: 'Real-Time Experience',
    description: 'Enjoy dynamic notifications, responsive interactions, smooth animations, and real-time event updates.',
    gradient: 'from-blue-500 to-cyan-500',
  },
];

export default function DiscoverSection() {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-16 sm:py-24">
      {/* Header */}
      <motion.div
        className="text-center max-w-3xl mx-auto mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          Discover EventHub
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold dark:text-white leading-tight">
          Creating smoother and smarter{' '}
          <span className="gradient-text">event experiences.</span>
        </h2>
        <p className="mt-6 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          EventHub is a modern event management platform designed to simplify how people create, discover, and manage events. From workshops and hackathons to music festivals and startup meetups, EventHub creates a smooth, interactive, and visually immersive experience for both organizers and attendees.
        </p>
        <p className="mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-500 leading-relaxed">
          Built with a premium glassmorphism interface, real-time interactions, seamless authentication, and modern responsive design, EventHub focuses on making event discovery and management effortless and engaging.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              className="group relative glass-card p-7 sm:p-8 glass-card-hover overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
            >
              {/* Glow blob */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-bold dark:text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Creator Section */}
      <motion.div
        className="relative glass-card overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="relative p-8 sm:p-12 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold tracking-[0.15em] uppercase text-purple-600 dark:text-purple-400 bg-purple-100/80 dark:bg-purple-900/40 backdrop-blur-sm rounded-full mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-3.5 h-3.5" /> The Creator
          </motion.div>

          <h3 className="font-display text-2xl sm:text-3xl font-bold dark:text-white mb-4">
            Designed & Developed by{' '}
            <span className="gradient-text">Vivek K.</span>
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Crafting digital experiences where design meets engineering. EventHub embodies a dedication to clean architecture, immersive interfaces, and seamless interactions — built with precision, intentionality, and an uncompromising standard for quality.
          </p>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500 leading-relaxed max-w-2xl mx-auto mt-4 italic">
            Always open to meaningful conversations, collaborations, and new opportunities. Feel free to connect and reach out through my socials.
          </p>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.a
              href="https://github.com/ehvivek"
              target="_blank"
              rel="noopener noreferrer"
              className="group/icon relative w-12 h-12 rounded-xl glass flex items-center justify-center border border-white/20 dark:border-white/10 hover:border-purple-400/50 transition-all duration-300"
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-hover/icon:bg-purple-500/10 transition-colors duration-300" />
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
              <FaGithub className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover/icon:text-purple-500 transition-colors duration-300 relative z-10" />
            </motion.a>

            <motion.a
              href="https://www.linkedin.com/in/vivekk52/"
              target="_blank"
              rel="noopener noreferrer"
              className="group/icon relative w-12 h-12 rounded-xl glass flex items-center justify-center border border-white/20 dark:border-white/10 hover:border-blue-400/50 transition-all duration-300"
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 rounded-xl bg-blue-500/0 group-hover/icon:bg-blue-500/10 transition-colors duration-300" />
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
              <FaLinkedin className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover/icon:text-blue-500 transition-colors duration-300 relative z-10" />
            </motion.a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
