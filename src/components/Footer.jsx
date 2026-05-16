import { motion } from 'framer-motion';
import { Home, Shield, Mail, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoUrl from '../assets/logos/eventhub_logo.png';

export default function Footer() {
  const cards = [
    {
      title: "HOME",
      subtext: "Back to the homepage",
      icon: Home,
      link: "/",
      isMail: false,
    },
    {
      title: "TERMS OF SERVICE",
      subtext: "Read our Terms of Service",
      icon: Shield,
      link: "/terms",
      isMail: false,
    },
    {
      title: "CONTACT",
      display: "ev3nthub@gmail.com",
      subtext: "We'll get back to you soon",
      icon: Mail,
      link: "mailto:ev3nthub@gmail.com",
      isMail: true,
    }
  ];

  return (
    <section className="w-full relative mt-20 border-t border-purple-500/10 dark:border-white/5 bg-gradient-to-b from-transparent to-purple-50/50 dark:to-[#0a0514]/80">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-purple-500/5 dark:bg-purple-600/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pt-20 pb-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/50 dark:bg-white/5 border border-purple-200/50 dark:border-white/10 mb-6"
          >
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 tracking-widest uppercase">Connect With Us</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold dark:text-white tracking-tight mb-4"
          >
            LET'S CONNECT
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Would love to hear your feedbacks.
          </motion.p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {cards.map((card, i) => {
            const Icon = card.icon;
            
            const CardContent = () => (
              <div className="h-full p-8 rounded-3xl border border-white/40 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-500 group overflow-hidden relative cursor-pointer bg-white/20 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(139,92,246,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                {/* Hover Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
                    <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    {card.title}
                  </h3>
                  {card.display && (
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                      {card.display}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {card.subtext}
                  </p>
                </div>
              </div>
            );

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="h-full"
              >
                {card.isMail ? (
                  <a href={card.link} className="block h-full outline-none">
                    <CardContent />
                  </a>
                ) : (
                  <Link 
                    to={card.link} 
                    className="block h-full outline-none"
                    onClick={() => {
                      if (card.title === "HOME") {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    <CardContent />
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-purple-500/10 dark:border-white/10 gap-4">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-1.5">
              <img src={logoUrl} alt="EventHub Logo" className="w-8 h-8 object-contain" />
              <span className="font-display text-2xl font-bold tracking-tight">
                <span className="text-[#c084fc] dark:text-[#c084fc]">Event</span>
                <span className="text-gray-900 dark:text-white">Hub</span>
              </span>
            </div>
            <p className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
              Your intelligent event space.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="text-[15px] font-medium text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} EventHub. All rights reserved.
            </div>
            <a 
              href="https://github.com/ehvivek" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[13px] text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors font-medium"
            >
              Created by Vivek ✦
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
