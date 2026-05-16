import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Globe, MessageCircleQuestion, Send, LogOut, CheckCircle, Loader2, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { isDark, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Language & Region state — persisted in localStorage
  const [language, setLanguage] = useState(() => localStorage.getItem('eh_language') || 'English (US)');
  const [region, setRegion] = useState(() => localStorage.getItem('eh_region') || 'India');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('eh_timezone') || 'Asia/Kolkata (GMT +5:30)');
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('eh_dateFormat') || 'DD MMM YYYY');
  const [regionSaved, setRegionSaved] = useState(false);



  const themes = [
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'dark', label: 'Dark Mode', icon: Moon },
  ];

  const handleRegionSave = () => {
    localStorage.setItem('eh_language', language);
    localStorage.setItem('eh_region', 'India');
    localStorage.setItem('eh_timezone', timezone);
    localStorage.setItem('eh_dateFormat', dateFormat);
    setRegionSaved(true);
    setTimeout(() => setRegionSaved(false), 2000);
  };


  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your experience and manage your preferences.</p>
      </div>

      {/* Appearance */}
      <motion.div className="glass-card p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Palette className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h2 className="font-display font-bold text-base dark:text-white">Appearance</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred theme.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map(({ id, label, icon: Icon }) => {
            const isActive = (id === 'light' && !isDark) || (id === 'dark' && isDark);
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
                  isActive
                    ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'glass-card hover:bg-white/40 dark:hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-500' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-purple-600 dark:text-purple-400' : 'dark:text-gray-300'}`}>{label}</span>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-purple-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Language & Region */}
      <motion.div className="glass-card p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Globe className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h2 className="font-display font-bold text-base dark:text-white">Language & Region</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Set your language and regional preferences.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-sm font-medium dark:text-gray-300">Language</span>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="glass-input px-4 py-2 text-sm min-w-[200px]">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Japanese</option>
              <option>Chinese (Simplified)</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/10 opacity-70">
            <span className="text-sm font-medium dark:text-gray-300">Region</span>
            <select disabled value="India" className="glass-input px-4 py-2 text-sm min-w-[200px] cursor-not-allowed">
              <option>India</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-sm font-medium dark:text-gray-300">Timezone</span>
            <select value={timezone} onChange={e => setTimezone(e.target.value)} className="glass-input px-4 py-2 text-sm min-w-[200px]">
              <option>Asia/Kolkata (GMT +5:30)</option>
              <option>America/New_York (GMT -5:00)</option>
              <option>America/Los_Angeles (GMT -8:00)</option>
              <option>Europe/London (GMT +0:00)</option>
              <option>Europe/Berlin (GMT +1:00)</option>
              <option>Asia/Tokyo (GMT +9:00)</option>
              <option>Australia/Sydney (GMT +11:00)</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium dark:text-gray-300">Date Format</span>
            <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="glass-input px-4 py-2 text-sm min-w-[200px]">
              <option>DD MMM YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={handleRegionSave}
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-md hover:shadow-lg flex items-center gap-2 transition-all"
          >
            {regionSaved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Preferences'}
          </button>
        </div>
      </motion.div>


      {/* Sign Out */}
      <motion.div className="glass-card p-6 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base dark:text-white">Sign Out</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of your EventHub account.</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="px-5 py-2.5 text-sm font-semibold text-red-500 border border-red-300 dark:border-red-800 rounded-xl flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
