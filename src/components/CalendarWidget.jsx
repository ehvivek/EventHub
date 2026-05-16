import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchEvents } from '../lib/database';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarWidget() {
  const { user } = useAuth();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [allEvents, setAllEvents] = useState([]);
  const [eventDayMap, setEventDayMap] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  const today = now.getDate();
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();

  useEffect(() => { loadEvents(); }, [currentMonth, currentYear]);

  const loadEvents = async () => {
    const { data } = await fetchEvents({});
    setAllEvents(data);
    // Build day -> events map for current month
    const map = {};
    data.forEach(event => {
      const d = new Date(event.start_date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(event);
      }
    });
    setEventDayMap(map);
  };

  const handleDayClick = (day, isCurrent) => {
    if (!isCurrent) return;
    setSelectedDay(day);
    setSelectedEvents(eventDayMap[day] || []);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
    setSelectedEvents([]);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
    setSelectedEvents([]);
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const days = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, current: false });
  for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, current: true });
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push({ day: i, current: false });

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
        <h3 className="font-display font-bold text-sm dark:text-white">{MONTHS[currentMonth]} {currentYear}</h3>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">{d}</div>)}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const isToday = d.current && isCurrentMonth && d.day === today;
          const isSelected = d.current && d.day === selectedDay;
          const hasEvent = d.current && eventDayMap[d.day];
          const eventCount = hasEvent ? eventDayMap[d.day].length : 0;

          return (
            <button
              key={i}
              onClick={() => handleDayClick(d.day, d.current)}
              className={`relative flex flex-col items-center justify-center h-9 rounded-full text-xs font-medium transition-all duration-200 ${
                !d.current ? 'text-gray-300 dark:text-gray-600'
                : isSelected ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-110'
                : isToday ? 'ring-2 ring-purple-400 text-purple-600 dark:text-purple-400 font-bold'
                : hasEvent ? 'text-purple-600 dark:text-purple-300 font-semibold hover:bg-purple-100/50 dark:hover:bg-purple-900/30'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/5'
              }`}
            >
              {d.day}
              {/* Event indicator */}
              {hasEvent && !isSelected && (
                <span className={`absolute -bottom-0.5 flex gap-0.5 ${eventCount > 1 ? '' : ''}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm shadow-purple-400/50" />
                  {eventCount > 1 && <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm shadow-blue-400/50" />}
                </span>
              )}
              {/* Glow ring for event days */}
              {hasEvent && !isSelected && (
                <span className="absolute inset-0 rounded-full ring-1 ring-purple-400/30 dark:ring-purple-500/20" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" /><span className="text-[10px] text-gray-500 dark:text-gray-400">Event</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full ring-2 ring-purple-400" /><span className="text-[10px] text-gray-500 dark:text-gray-400">Today</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm shadow-purple-500/50" /><span className="text-[10px] text-gray-500 dark:text-gray-400">Selected</span></div>
      </div>

      {/* Selected day events */}
      <AnimatePresence mode="wait">
        {selectedDay !== null && (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
                {MONTHS[currentMonth]} {selectedDay}, {currentYear}
              </p>

              {selectedEvents.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 dark:text-gray-500">No events scheduled for this day</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map(event => (
                    <Link
                      key={event.id}
                      to={`/event/${event.id}`}
                      className="block p-3 rounded-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/10 transition-all group"
                    >
                      <h4 className="text-sm font-semibold dark:text-white truncate group-hover:text-purple-500 transition-colors">{event.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(event.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                          {event.event_type === 'Online' ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          <span className="truncate max-w-[100px]">{event.location || event.event_type}</span>
                        </div>
                      </div>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-full">{event.category}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
