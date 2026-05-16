import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Orbit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchRegistrations, fetchVaultEvents, fetchMyEvents } from '../lib/database';
import ChronoCalendarView from '../components/ChronoCalendarView';
import ChronoOrbitView from '../components/ChronoOrbitView';
import ChronoTimeline from '../components/ChronoTimeline';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Chrono() {
  const { user } = useAuth();
  const now = new Date();

  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  // View modes
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'orbit'
  const [subMode, setSubMode] = useState('month'); // 'month' | 'week' | 'list'

  // Data
  const [registrations, setRegistrations] = useState([]);
  const [vaultEvents, setVaultEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadAllEvents();
  }, [user]);

  const loadAllEvents = async () => {
    setLoading(true);
    const [regRes, vaultRes, myRes] = await Promise.all([
      fetchRegistrations(user.id),
      fetchVaultEvents(user.id),
      fetchMyEvents(user.id),
    ]);

    setRegistrations(regRes.data || []);
    setVaultEvents(vaultRes.data || []);
    setMyEvents(myRes.data || []);
    setLoading(false);
  };

  // Merge all events into unified list, deduplicate by event id
  const allEvents = useMemo(() => {
    const eventMap = new Map();

    // Registered/joined EventHub events
    registrations.forEach(reg => {
      if (reg.events) {
        const ev = reg.events;
        if (!eventMap.has(ev.id)) {
          eventMap.set(ev.id, { ...ev, _source: 'eventhub', _uniqueId: `eh-${ev.id}` });
        }
      }
    });

    // My created events
    myEvents.forEach(ev => {
      if (!eventMap.has(ev.id)) {
        eventMap.set(ev.id, { ...ev, _source: 'eventhub', _uniqueId: `my-${ev.id}` });
      }
    });

    // Vault events (separate table, always unique)
    const vaultMapped = vaultEvents.map(ev => ({
      ...ev,
      _source: 'vault',
      _uniqueId: `vault-${ev.id}`,
      category: ev.category || 'Personal',
    }));

    return [...eventMap.values(), ...vaultMapped];
  }, [registrations, vaultEvents, myEvents]);

  // Navigation
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const goToday = () => {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDay(now.getDate());
  };

  const handleSelectDay = (day) => {
    setSelectedDay(prev => prev === day ? null : day);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="glass-card p-6 md:p-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Decorative orbs */}
        <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold dark:text-white tracking-tight">
                  Events <span className="gradient-text">Calendar</span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your gateway to unforgettable experiences</p>
              </div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Today + Navigation + Month */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={goToday}
                className="category-pill text-xs font-semibold"
              >
                Today
              </button>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold dark:text-white">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
            </div>

            {/* Right: Sub-mode tabs + View toggle */}
            <div className="flex items-center gap-3">
              {/* Sub-mode: Month/Week/List (only in calendar mode) */}
              {viewMode === 'calendar' && (
                <div className="flex items-center bg-white/20 dark:bg-white/5 rounded-xl p-1 border border-white/20 dark:border-white/10">
                  {['month', 'week', 'list'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSubMode(mode)}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                        subMode === mode
                          ? 'bg-white/60 dark:bg-white/10 text-purple-600 dark:text-purple-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {mode === 'month' ? 'Month' : mode === 'week' ? 'Week' : 'List'}
                    </button>
                  ))}
                </div>
              )}

              {/* Calendar / Orbit Toggle */}
              <div className="flex items-center bg-white/20 dark:bg-white/5 rounded-xl p-1 border border-white/20 dark:border-white/10">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('orbit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                    viewMode === 'orbit'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Orbit className="w-3.5 h-3.5" />
                  Orbit
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content: Calendar/Orbit + Timeline */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card h-[500px] animate-pulse" />
          <div className="glass-card h-[500px] animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Calendar or Orbit view */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {viewMode === 'calendar' ? (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChronoCalendarView
                    events={allEvents}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onPrevMonth={prevMonth}
                    onNextMonth={nextMonth}
                    onSelectDay={handleSelectDay}
                    selectedDay={selectedDay}
                    subMode={subMode}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="orbit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChronoOrbitView
                    events={allEvents}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onSelectDay={handleSelectDay}
                    selectedDay={selectedDay}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Timeline */}
          <div>
            <ChronoTimeline events={allEvents} />
          </div>
        </div>
      )}
    </div>
  );
}
