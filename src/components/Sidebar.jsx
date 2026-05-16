import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Globe, Compass, Heart, Ticket, Bell, User, Settings, Plus, ArrowRight, X, MessageCircleQuestion, Lock, Calendar
} from 'lucide-react';
import logo from '../assets/logos/eventhub_logo.png';

const navItems = [
  { name: 'Home', icon: Globe, path: '/' },
  { name: 'Dashboard', icon: Home, path: '/dashboard' },
  { name: 'Explore Events', icon: Compass, path: '/explore' },
  { name: 'Chrono', icon: Calendar, path: '/chrono' },
  { name: 'Custom Vault', icon: Lock, path: '/vault' },
  { name: 'Saved Events', icon: Heart, path: '/saved' },
  { name: 'My Tickets', icon: Ticket, path: '/my-tickets' },
  { name: 'Notifications', icon: Bell, path: '/notifications' },
  { name: 'Profile', icon: User, path: '/profile' },
  { name: 'Settings', icon: Settings, path: '/settings' },
  { name: 'Query', icon: MessageCircleQuestion, path: '/query' },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const isActive = (item) => {
    if (item.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.path);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="EventHub" className="w-9 h-9 object-contain" />
          <span className="font-display text-xl font-bold">
            <span className="text-purple-600 dark:text-purple-400">Event</span>
            <span className="dark:text-white">Hub</span>
          </span>
        </NavLink>
        <button className="lg:hidden ml-auto p-1 rounded-lg hover:bg-white/20" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative ${
                active
                  ? 'nav-pill-active text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/5 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
              <span>{item.name}</span>
              {item.badge && (
                <span className={`ml-auto w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${
                  active ? 'bg-white/30 text-white' : 'bg-red-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Create Event CTA */}
      <div className="mx-3 mb-4 p-5 glass-card">
        <h3 className="font-display font-bold text-sm gradient-text">Create Your Own Event</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
          Host, manage and grow your event with EventHub.
        </p>
        <NavLink
          to="/create-event"
          onClick={onClose}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg w-fit"
        >
          Create Event
          <ArrowRight className="w-4 h-4" />
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 glass-sidebar z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 w-64 glass-sidebar z-50 lg:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
