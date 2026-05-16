import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Calendar, MapPin, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LandingNavbar } from '../components/Navbar';
import FloatingParticles from '../components/FloatingParticles';
import OrbitAnimation from '../components/OrbitAnimation';
import SearchBar from '../components/SearchBar';
import WhyEventHub from '../components/WhyEventHub';
import Footer from '../components/Footer';

import { landingCategories } from '../data/mockEvents';
import bgLight from '../assets/backgrounds/bg_light.png';
import bgDark from '../assets/backgrounds/bg_dark.png';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchEvents } from '../lib/database';

export default function Homepage() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentEvents, setRecentEvents] = useState([]);

  const handleCategoryClick = (categoryName) => {
    const searchStr = `?category=${encodeURIComponent(categoryName)}`;
    if (user) {
      navigate(`/explore${searchStr}`);
    } else {
      navigate('/login', { state: { from: { pathname: '/explore', search: searchStr } } });
    }
  };

  useEffect(() => {
    fetchEvents({ limit: 4 }).then(({ data }) => setRecentEvents(data));
  }, []);

  const formatDate = (d) => {
    const date = new Date(d);
    return { month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), day: date.getDate().toString() };
  };

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={isDark ? bgDark : bgLight}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/30 dark:bg-black/40" />
      </div>

      <FloatingParticles />

      <div className="relative z-10">
        <LandingNavbar />

        {/* ===== HERO SECTION ===== */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-20 pt-8 sm:pt-10 pb-6">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 items-center">
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="z-10 text-center lg:text-left"
            >
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05]">
                <span className="dark:text-white">Events</span>
                <br />
                <span className="gradient-text">made</span>
                <br />
                <span className="dark:text-white">easy</span>
              </h1>
              <p className="mt-5 text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-md leading-relaxed mx-auto lg:mx-0">
                Send one link. Collect RSVPs.<br />
                See who&apos;s actually coming.
              </p>
              <AnimatePresence mode="wait">
                {user ? (
                  <motion.div key="auth-cta" className="flex flex-col gap-4 mt-6 items-center lg:items-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <Link
                      to="/create-event"
                      className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Create Public Event
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => navigate('/explore')}
                      className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Join Events
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="guest-cta" className="flex flex-col gap-4 mt-6 items-center lg:items-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <Link
                      to="/signup"
                      className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Get started for free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => navigate('/login', { state: { from: { pathname: '/explore' } } })}
                      className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Join Events
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right - Orbit Animation */}
            <motion.div
              className="relative overflow-visible flex items-center justify-center py-8 sm:py-12 lg:py-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <OrbitAnimation />
            </motion.div>
          </div>
        </section>

        {/* ===== SEARCH BAR ===== */}
        <section className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <SearchBar />
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {recentEvents.length} events live now
            </div>
          </div>
        </section>

        {/* ===== TRENDING CATEGORIES ===== */}
        <section id="categories" className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-4">
          <h3 className="font-display font-bold text-sm mb-3 dark:text-white">Trending categories</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {landingCategories.map((cat) => (
              <button 
                key={cat.name} 
                onClick={() => handleCategoryClick(cat.name)}
                className="category-pill flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
              >
                <img src={cat.svg} alt={cat.name} className="w-4 h-4 dark:invert opacity-90" />
                <span>{cat.name}</span>
              </button>
            ))}
            <Link to={user ? '/explore' : '/signup'} className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-500 font-medium ml-2">
              View all
            </Link>
          </div>
        </section>

        {/* ===== FEATURED EVENTS (REAL DATA) ===== */}
        <section id="events" className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-8">
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg dark:text-white flex items-center gap-2">
                Featured Events <Sparkles className="w-4 h-4 text-purple-500" />
              </h2>
              <Link to={user ? '/explore' : '/signup'} className="text-xs text-purple-500 hover:text-purple-600 font-medium flex items-center gap-1">
                View all events <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No events available yet</p>
                <Link
                  to={user ? '/create-event' : '/signup'}
                  className="mt-3 inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {user ? 'Create your first event' : 'Get started'}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentEvents.slice(0, 4).map((event, i) => {
                  const { month, day } = formatDate(event.start_date);
                  return (
                    <motion.div
                      key={event.id}
                      className="glass-card glass-card-hover overflow-hidden cursor-pointer group"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      whileHover={{ y: -6 }}
                    >
                      <Link to={user ? `/event/${event.id}` : '/login'}>
                        <div className="relative overflow-hidden h-44">
                          <img
                            src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop'}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white bg-purple-500/80 backdrop-blur-md rounded-lg">{event.category}</span>
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center bg-purple-100 dark:bg-purple-900/30 rounded-lg px-2.5 py-1.5 min-w-[48px]">
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">{month}</span>
                            <span className="text-lg font-bold text-purple-700 dark:text-purple-300">{day}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate dark:text-white">{event.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.location || event.event_type}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </section>


        {/* ===== CTA SECTION ===== */}
        <section className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
          <motion.div
            className="relative h-full w-full rounded-3xl border border-white/40 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-500 group overflow-hidden bg-white/20 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(139,92,246,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-10 sm:p-14 text-center cursor-default"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Hover Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
            {/* Ambient inner glows */}
              <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[60%] h-[60%] bg-purple-300/30 dark:bg-purple-600/10 blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-[30%] right-[10%] w-[40%] h-[50%] bg-blue-200/40 dark:bg-blue-600/10 blur-[80px] pointer-events-none" />
              
              {/* Orbital lines */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[250px] border border-gray-300/30 dark:border-white/[0.03] rounded-[100%] rotate-12 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[180px] border border-purple-300/20 dark:border-purple-500/[0.05] rounded-[100%] -rotate-12 pointer-events-none" />
              
              {/* Tiny glowing stars/particles - Visible only in dark mode */}
              <div className="hidden dark:block absolute top-[20%] left-[15%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" />
              <div className="hidden dark:block absolute bottom-[25%] right-[12%] w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_12px_3px_rgba(96,165,250,0.8)] animate-pulse" />
              <div className="hidden dark:block absolute top-[35%] right-[22%] w-1 h-1 bg-pink-400 rounded-full shadow-[0_0_10px_2px_rgba(244,114,182,0.8)]" />
              <div className="hidden dark:block absolute bottom-[40%] left-[20%] w-1 h-1 bg-purple-400 rounded-full shadow-[0_0_10px_2px_rgba(168,85,247,0.8)] opacity-70" />

              <div className="relative z-10 flex flex-col items-center">
                {/* Badge/Pill */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-purple-100 dark:border-white/10 shadow-sm dark:shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                >
                  <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-200 tracking-widest uppercase">Your personal intelligent event space</span>
                </motion.div>

                <AnimatePresence mode="wait">
                  {user ? (
                    <motion.div key="cta-auth" className="flex flex-col items-center" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
                      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight drop-shadow-sm dark:drop-shadow-md">Manage every event in one place</h2>
                      <p className="text-gray-600 dark:text-gray-300 font-medium text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
                        Store your third-party events, personal schedules, workshops, hackathons, college events, and online sessions inside your own private Custom Vault.
                      </p>
                      
                      {/* Button */}
                      <div className="relative mt-8 group inline-block">
                        {/* Glow halo only visible in dark mode */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-0 dark:opacity-60 dark:group-hover:opacity-100 transition-opacity duration-300" />
                        <Link
                          to="/vault"
                          className="relative inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-bold text-white bg-purple-600 dark:bg-[#140824]/80 border border-purple-500 dark:border-white/20 backdrop-blur-xl rounded-full hover:bg-purple-700 dark:hover:bg-white/10 hover:border-purple-600 dark:hover:border-white/40 shadow-lg shadow-purple-500/30 dark:shadow-none transition-all hover:scale-105 active:scale-100"
                        >
                          <Lock className="w-4 h-4 text-white/90 dark:text-purple-300 group-hover:text-white transition-colors" />
                          Open Custom Vault
                          <ArrowRight className="w-4 h-4 text-white/90 dark:text-purple-300 group-hover:translate-x-1 group-hover:text-white transition-all" />
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="cta-guest" className="flex flex-col items-center" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
                      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight drop-shadow-sm dark:drop-shadow-md">Manage every event in one place</h2>
                      <p className="text-gray-600 dark:text-gray-300 font-medium text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
                        Store your third-party events, personal schedules, workshops, hackathons, college events, and online sessions inside your own private Custom Vault.
                      </p>
                      
                      {/* Button */}
                      <div className="relative mt-8 group inline-block">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-0 dark:opacity-60 dark:group-hover:opacity-100 transition-opacity duration-300" />
                        <Link
                          to="/signup"
                          className="relative inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-bold text-white bg-purple-600 dark:bg-[#140824]/80 border border-purple-500 dark:border-white/20 backdrop-blur-xl rounded-full hover:bg-purple-700 dark:hover:bg-white/10 hover:border-purple-600 dark:hover:border-white/40 shadow-lg shadow-purple-500/30 dark:shadow-none transition-all hover:scale-105 active:scale-100"
                        >
                          <Lock className="w-4 h-4 text-white/90 dark:text-purple-300 group-hover:text-white transition-colors" />
                          Unlock Your Vault
                          <ArrowRight className="w-4 h-4 text-white/90 dark:text-purple-300 group-hover:translate-x-1 group-hover:text-white transition-all" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
          </motion.div>
        </section>

        {/* ===== WHY EVENTHUB ===== */}
        <section id="calendar" className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-8">
          <WhyEventHub />
        </section>

      </div>

      {/* ===== PREMIUM FOOTER SECTION ===== */}
      <Footer />
    </motion.div>
  );
}
