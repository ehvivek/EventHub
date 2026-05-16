import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Calendar, Clock, Star, CheckCircle } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CATEGORY_COLORS = {
  Music: { ring: 'ring-pink-500', bg: 'bg-pink-500', text: 'text-pink-500', shadow: 'shadow-pink-500/40' },
  Business: { ring: 'ring-blue-500', bg: 'bg-blue-500', text: 'text-blue-500', shadow: 'shadow-blue-500/40' },
  Culture: { ring: 'ring-purple-500', bg: 'bg-purple-500', text: 'text-purple-500', shadow: 'shadow-purple-500/40' },
  Workshop: { ring: 'ring-green-500', bg: 'bg-green-500', text: 'text-green-500', shadow: 'shadow-green-500/40' },
  Entertainment: { ring: 'ring-orange-500', bg: 'bg-orange-500', text: 'text-orange-500', shadow: 'shadow-orange-500/40' },
  Sports: { ring: 'ring-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-500', shadow: 'shadow-cyan-500/40' },
  Technology: { ring: 'ring-indigo-500', bg: 'bg-indigo-500', text: 'text-indigo-500', shadow: 'shadow-indigo-500/40' },
  Default: { ring: 'ring-purple-500', bg: 'bg-purple-500', text: 'text-purple-500', shadow: 'shadow-purple-500/40' },
};

function getCategoryStyle(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ChronoOrbitView({ events, currentMonth, currentYear, onSelectDay, selectedDay }) {
  const now = new Date();
  const today = now.getDate();
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const [hoveredDay, setHoveredDay] = useState(null);

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

  // Stats
  const stats = useMemo(() => {
    const monthEvents = events.filter(e => {
      const d = new Date(e.start_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const nowDate = new Date();
    return {
      total: monthEvents.length,
      upcoming: monthEvents.filter(e => new Date(e.start_date) >= nowDate).length,
      thisWeek: monthEvents.filter(e => {
        const d = new Date(e.start_date);
        const diff = (d - nowDate) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      }).length,
      completed: monthEvents.filter(e => new Date(e.start_date) < nowDate).length,
    };
  }, [events, currentMonth, currentYear]);

  // Categories present
  const activeCategories = useMemo(() => {
    const cats = new Set();
    events.forEach(e => { if (e.category) cats.add(e.category); });
    return [...cats].slice(0, 6);
  }, [events]);

  // Place days in orbit
  // We'll create 3 concentric rings
  const centerX = 50; // percentage
  const centerY = 50;

  const rings = [
    { radiusX: 18, radiusY: 14 }, // inner
    { radiusX: 30, radiusY: 24 }, // middle
    { radiusX: 42, radiusY: 34 }, // outer
  ];

  const dayPositions = useMemo(() => {
    const positions = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const ringIndex = day <= 10 ? 0 : day <= 20 ? 1 : 2;
      const ring = rings[ringIndex];
      const daysInRing = ringIndex === 0 ? 10 : ringIndex === 1 ? 10 : daysInMonth - 20;
      const dayInRing = ringIndex === 0 ? day - 1 : ringIndex === 1 ? day - 11 : day - 21;
      const angle = (dayInRing / daysInRing) * Math.PI * 2 - Math.PI / 2;

      positions.push({
        day,
        x: centerX + ring.radiusX * Math.cos(angle),
        y: centerY + ring.radiusY * Math.sin(angle),
        hasEvent: !!eventDayMap[day],
        events: eventDayMap[day] || [],
        isToday: isCurrentMonth && day === today,
        isSelected: day === selectedDay,
      });
    }
    return positions;
  }, [daysInMonth, eventDayMap, isCurrentMonth, today, selectedDay]);

  // Find event days that get floating cards
  const floatingCards = useMemo(() => {
    return dayPositions
      .filter(dp => dp.hasEvent && (dp.day === hoveredDay || dp.day === selectedDay))
      .map(dp => ({
        ...dp,
        event: dp.events[0],
      }));
  }, [dayPositions, hoveredDay, selectedDay]);

  return (
    <motion.div
      className="glass-card p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Category Legend - Left side */}
        <div className="hidden lg:flex flex-col gap-3 pt-8 flex-shrink-0 w-28">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">EventHub</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-2.5 h-2.5 text-pink-400" />
            <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Vault</span>
          </div>
        </div>

        {/* Orbit Visualization */}
        <div className="flex-1 relative">
          <div className="relative w-full" style={{ paddingBottom: '80%' }}>
            <div className="absolute inset-0">
              {/* Orbit rings */}
              {rings.map((ring, i) => (
                <div
                  key={i}
                  className="absolute border border-purple-500/20 dark:border-white/10 rounded-full"
                  style={{
                    left: `${centerX - ring.radiusX}%`,
                    top: `${centerY - ring.radiusY}%`,
                    width: `${ring.radiusX * 2}%`,
                    height: `${ring.radiusY * 2}%`,
                  }}
                />
              ))}

              {/* Glowing orbit ring for middle */}
              <div
                className="absolute border border-purple-500/30 dark:border-purple-500/20 rounded-full"
                style={{
                  left: `${centerX - rings[1].radiusX}%`,
                  top: `${centerY - rings[1].radiusY}%`,
                  width: `${rings[1].radiusX * 2}%`,
                  height: `${rings[1].radiusY * 2}%`,
                  boxShadow: '0 0 30px rgba(139, 92, 246, 0.05), inset 0 0 30px rgba(139, 92, 246, 0.05)',
                }}
              />

              {/* Center - Month/Year */}
              <div
                className="absolute flex flex-col items-center justify-center"
                style={{
                  left: `${centerX - 10}%`,
                  top: `${centerY - 8}%`,
                  width: '20%',
                  height: '16%',
                }}
              >
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {MONTHS[currentMonth].slice(0, 3)}
                </span>
                <span className="text-xl sm:text-2xl font-display font-extrabold dark:text-white">
                  {currentYear}
                </span>
              </div>

              {/* Day nodes */}
              {dayPositions.map((dp) => {
                const catStyle = dp.hasEvent ? getCategoryStyle(dp.events[0].category) : null;
                const nodeSize = dp.isToday ? 'w-8 h-8 sm:w-10 sm:h-10' : dp.hasEvent ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-5 h-5 sm:w-6 sm:h-6';

                return (
                  <motion.button
                    key={dp.day}
                    className={`absolute rounded-full flex items-center justify-center transition-all duration-300 ${nodeSize} ${
                      dp.isSelected
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 z-20 scale-125'
                        : dp.isToday
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400/50 z-10'
                        : dp.hasEvent
                        ? `bg-white/10 dark:bg-white/5 ring-2 ${catStyle.ring} ring-opacity-50 z-10`
                        : 'bg-white/5 dark:bg-white/[0.03] text-gray-500 dark:text-gray-600 hover:bg-white/20 dark:hover:bg-white/10'
                    }`}
                    style={{
                      left: `${dp.x}%`,
                      top: `${dp.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={() => onSelectDay(dp.day)}
                    onMouseEnter={() => setHoveredDay(dp.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    whileHover={{ scale: dp.isSelected ? 1.25 : 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: dp.isSelected ? 1.25 : 1 }}
                    transition={{ delay: dp.day * 0.015, duration: 0.3 }}
                  >
                    <span className={`text-[8px] sm:text-[10px] font-bold ${
                      dp.isSelected || dp.isToday ? 'text-white' : dp.hasEvent ? 'dark:text-white text-gray-700' : ''
                    }`}>
                      {dp.day}
                    </span>

                    {/* Glow dot for event days */}
                    {dp.hasEvent && !dp.isSelected && (
                      <span className={`absolute -bottom-0.5 w-1 h-1 rounded-full ${catStyle.bg} shadow-sm ${catStyle.shadow}`} />
                    )}
                  </motion.button>
                );
              })}

              {/* Floating event cards */}
              {floatingCards.map((fc, i) => {
                const isVault = fc.event._source === 'vault';
                // Position cards slightly offset from their day node
                const offsetX = fc.x > 50 ? 8 : -32;
                const offsetY = fc.y > 50 ? 6 : -10;

                return (
                  <motion.div
                    key={fc.day}
                    className="absolute z-30 hidden sm:block"
                    style={{
                      left: `${fc.x + offsetX}%`,
                      top: `${fc.y + offsetY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                  >
                    <div className={`p-2 px-2.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 text-[8px] sm:text-[9px] ${
                      isVault 
                        ? 'border border-pink-500/40 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                        : 'glass shadow-lg'
                    }`}>
                      {isVault ? (
                        <Lock className="w-2.5 h-2.5 text-pink-400 flex-shrink-0" />
                      ) : (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getCategoryStyle(fc.event.category).bg}`} />
                      )}
                      <div>
                        <p className="font-bold dark:text-white truncate max-w-[100px]">{fc.event.title}</p>
                        <p className="text-gray-400 dark:text-gray-500">{formatTime(fc.event.start_date)}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Tiny glowing particles along orbits */}
              {[...Array(8)].map((_, i) => {
                const ringIdx = i % 3;
                const ring = rings[ringIdx];
                const angle = (i / 8) * Math.PI * 2;
                const px = centerX + ring.radiusX * Math.cos(angle);
                const py = centerY + ring.radiusY * Math.sin(angle);
                return (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-0.5 h-0.5 rounded-full bg-purple-400/60 dark:bg-purple-400/40"
                    style={{ left: `${px}%`, top: `${py}%` }}
                    animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar at bottom */}
      <div className="flex items-center justify-around mt-6 pt-4 border-t border-white/10 dark:border-white/5">
        {[
          { icon: Calendar, value: stats.total, label: 'Total Events', color: 'text-purple-500' },
          { icon: Clock, value: stats.upcoming, label: 'Upcoming', color: 'text-blue-500' },
          { icon: Star, value: stats.thisWeek, label: 'This Week', color: 'text-orange-500' },
          { icon: CheckCircle, value: stats.completed, label: 'Completed', color: 'text-green-500' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <div>
              <p className="text-lg font-display font-extrabold dark:text-white">{stat.value}</p>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile category legend */}
      <div className="flex lg:hidden flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/10 dark:border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">EventHub</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-2.5 h-2.5 text-pink-400" />
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Vault</span>
        </div>
      </div>
    </motion.div>
  );
}
