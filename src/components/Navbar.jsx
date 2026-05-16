import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import logo from '../assets/logos/eventhub_logo.png';

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  
  const links = [
    { name: 'Events', href: '/#events' },
    { name: 'Categories', href: '/#categories' },
    { name: 'Chrono', href: '/chrono' },
  ];

  return (
    <motion.nav
      className="sticky top-0 z-50 glass-navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="EventHub" className="w-8 h-8 object-contain" />
            <span className="font-display text-xl font-bold">
              <span className="text-purple-600 dark:text-purple-400">Event</span>
              <span className="dark:text-white">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <Link to="/discover" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Discover
            </Link>
            <Link to="/terms" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Terms
            </Link>
            {user && (
              <Link to="/explore" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Explore
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  to="/create-event"
                  className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-600 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                >
                  Create Event
                </Link>
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-block px-5 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                  Dashboard
                </Link>
                <Link to="/profile" className="hidden sm:flex items-center gap-2 pl-1">
                  <img
                    src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email)}&background=8b5cf6&color=fff`}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border-2 border-purple-300 dark:border-purple-600"
                  />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-block px-5 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                  Sign up
                </Link>
              </>
            )}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden glass"
          >
            <div className="px-4 py-4 space-y-3">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Link to="/discover" className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400" onClick={() => setMobileOpen(false)}>
                Discover
              </Link>
              <Link to="/terms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400" onClick={() => setMobileOpen(false)}>
                Terms
              </Link>
              <div className="flex gap-3 pt-3 border-t border-white/20 dark:border-white/10">
                {user ? (
                  <>
                    <Link to="/dashboard" className="px-4 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                    <Link to="/create-event" className="text-sm font-medium text-purple-600 dark:text-purple-400" onClick={() => setMobileOpen(false)}>Create Event</Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-medium text-purple-600 dark:text-purple-400" onClick={() => setMobileOpen(false)}>Log in</Link>
                    <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500" onClick={() => setMobileOpen(false)}>Sign up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export function DashboardNavbar({ onMenuToggle }) {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8b5cf6&color=fff`;

  useState(() => {
    if (user) {
      import('../lib/database').then(({ getUnreadCount }) => {
        getUnreadCount(user.id).then(setUnreadCount);
      });
    }
  });

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/explore?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <motion.nav
      className="sticky top-0 z-40 glass-navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search events, workshops, concerts..."
              className="w-full pl-11 pr-4 py-2.5 glass-input text-sm"
              id="dashboard-search"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-colors" aria-label="Notifications">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" />
          </button>
          <Link to="/profile" className="flex items-center gap-2 pl-1 hover:opacity-80 transition-opacity">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover border-2 border-purple-300 dark:border-purple-600"
            />
            <span className="hidden sm:block text-sm font-medium dark:text-white">{displayName}</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
