import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, MapPin, Globe, Lock, Calendar } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CATEGORY_COLORS = {
  Music: 'bg-pink-500',
  Business: 'bg-blue-500',
  Culture: 'bg-purple-500',
  Workshop: 'bg-green-500',
  Entertainment: 'bg-orange-500',
  Sports: 'bg-cyan-500',
  Technology: 'bg-indigo-500',
  Default: 'bg-purple-500',
};

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ChronoCalendarView({ events, currentMonth, currentYear, onPrevMonth, onNextMonth, onSelectDay, selectedDay, subMode }) {
  const now = new Date();
  const today = now.getDate();
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();

  // Build day -> events map
  const eventDayMap = useMemo(() => {
    const map = {};
    events.forEach(event => {
      const d = new Date(event.start_date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(event);
      }
    });
    return map;
  }, [events, currentMonth, currentYear]);

  // Calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const days = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, current: false });
  for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, current: true });
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push({ day: i, current: false });

  // Week view
  const getWeekDays = () => {
    const startOfWeek = new Date(currentYear, currentMonth, selectedDay || today);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      week.push({
        day: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        current: d.getMonth() === currentMonth,
        isToday: d.getDate() === today && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(),
      });
    }
    return week;
  };

  // List view
  const listEvents = useMemo(() => {
    return events
      .filter(e => {
        const d = new Date(e.start_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  }, [events, currentMonth, currentYear]);

  // Legend categories
  const activeCategories = useMemo(() => {
    const cats = new Set();
    events.forEach(e => {
      if (e.category) cats.add(e.category);
    });
    return [...cats].slice(0, 6);
  }, [events]);

  if (subMode === 'week') {
    const weekDays = getWeekDays();
    return (
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((wd, i) => (
            <div
              key={i}
              className={`text-center p-3 rounded-xl cursor-pointer transition-all ${
                wd.isToday
                  ? 'ring-2 ring-purple-400 bg-purple-100/50 dark:bg-purple-900/30'
                  : selectedDay === wd.day && wd.current
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                  : wd.current
                  ? 'hover:bg-white/30 dark:hover:bg-white/5'
                  : 'opacity-40'
              }`}
              onClick={() => wd.current && onSelectDay(wd.day)}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${
                selectedDay === wd.day && wd.current ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
              }`}>{DAYS[i]}</p>
              <p className={`text-lg font-bold ${
                selectedDay === wd.day && wd.current ? 'text-white' : 'dark:text-white'
              }`}>{wd.day}</p>
              {/* Event dots */}
              {wd.current && eventDayMap[wd.day] && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {eventDayMap[wd.day].slice(0, 3).map((e, ei) => (
                    <span key={ei} className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(e.category)}`} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Events for selected day */}
        <AnimatePresence mode="wait">
          {selectedDay && eventDayMap[selectedDay] && (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2 mt-4 pt-4 border-t border-white/10"
            >
              {eventDayMap[selectedDay].map(event => (
                <EventChip key={event._uniqueId || event.id} event={event} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (subMode === 'list') {
    return (
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 hide-scrollbar">
          {listEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500">No events this month</p>
            </div>
          ) : (
            listEvents.map((event, i) => (
              <motion.div
                key={event._uniqueId || event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <EventChip event={event} expanded />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  // Month view (default)
  return (
    <motion.div
      className="glass-card p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-white/15 dark:border-white/5">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 py-2.5 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 border-l border-white/10 dark:border-white/5">
        {days.map((d, i) => {
          const isToday = d.current && isCurrentMonth && d.day === today;
          const isSelected = d.current && d.day === selectedDay;
          const dayEvents = d.current ? (eventDayMap[d.day] || []) : [];
          const hasEvent = dayEvents.length > 0;

          return (
            <button
              key={i}
              onClick={() => d.current && onSelectDay(d.day)}
              className={`relative flex flex-col items-start p-1.5 sm:p-2 text-left h-[60px] sm:h-[72px] border-r border-b border-white/10 dark:border-white/5 transition-all duration-200 ${
                !d.current ? 'opacity-30'
                : isSelected ? 'bg-gradient-to-br from-purple-500/15 to-pink-500/15 ring-1 ring-inset ring-purple-500/40'
                : isToday ? 'bg-purple-100/30 dark:bg-purple-900/20'
                : hasEvent ? 'hover:bg-white/20 dark:hover:bg-white/5'
                : 'hover:bg-white/10 dark:hover:bg-white/[0.03]'
              }`}
            >
              {/* Day number */}
              <span className={`text-xs sm:text-sm font-semibold leading-none ${
                isToday ? 'w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-purple-500 text-white'
                : isSelected ? 'text-purple-600 dark:text-purple-300 font-bold'
                : d.current ? 'text-gray-700 dark:text-gray-300'
                : 'text-gray-300 dark:text-gray-600'
              }`}>
                {d.day}
              </span>

              {/* Event chips */}
              {hasEvent && (
                <div className="mt-0.5 w-full space-y-px overflow-hidden flex-1">
                  {dayEvents.slice(0, 2).map((event, ei) => (
                    <div
                      key={ei}
                      className={`flex items-center gap-0.5 px-1 py-px rounded text-[7px] sm:text-[8px] font-semibold truncate ${
                        event._source === 'vault'
                          ? 'border border-pink-500/40 text-pink-400 bg-transparent shadow-[0_0_8px_rgba(236,72,153,0.2)]'
                          : 'bg-purple-200/60 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {event._source === 'vault' ? (
                        <Lock className="w-2 h-2 flex-shrink-0" />
                      ) : (
                        <span className={`w-1 h-1 rounded-full flex-shrink-0 ${getCategoryColor(event.category)}`} />
                      )}
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[7px] font-bold text-purple-400 dark:text-purple-500 pl-0.5">
                      +{dayEvents.length - 2}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/10 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">EventHub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-2.5 h-2.5 text-pink-400" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Vault</span>
          </div>
        </div>

      {/* Selected day events panel */}
      <AnimatePresence mode="wait">
        {selectedDay !== null && eventDayMap[selectedDay] && eventDayMap[selectedDay].length > 0 && (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/10 dark:border-white/5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
                {MONTHS[currentMonth]} {selectedDay}, {currentYear}
              </p>
              <div className="space-y-2">
                {eventDayMap[selectedDay].map(event => (
                  <EventChip key={event._uniqueId || event.id} event={event} expanded />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EventChip({ event, expanded = false }) {
  const isVault = event._source === 'vault';

  return (
    <div className={`p-3 rounded-xl transition-all group ${expanded ? '' : ''} ${
      isVault
        ? 'border border-pink-500/30 dark:border-pink-500/40 bg-transparent shadow-[0_0_15px_rgba(236,72,153,0.1)] hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]'
        : 'bg-white/40 dark:bg-white/[0.08] border border-white/20 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/[0.12] shadow-sm'
    }`}>
      <div className="flex items-start gap-2">
        {!isVault && (
          <span className={`w-1.5 h-full min-h-[20px] rounded-full flex-shrink-0 ${getCategoryColor(event.category)}`} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isVault && <Lock className="w-3 h-3 text-pink-400 flex-shrink-0" />}
            <h4 className="text-sm font-semibold dark:text-white truncate group-hover:text-purple-500 transition-colors">{event.title}</h4>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <Clock className="w-2.5 h-2.5" />
              <span>{formatTime(event.start_date)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                {event.event_type === 'Online' ? <Globe className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                <span className="truncate max-w-[120px]">{event.location}</span>
              </div>
            )}
          </div>
          {event.category && (
            <span className="inline-block mt-1.5 px-2 py-0.5 text-[8px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              {event.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
