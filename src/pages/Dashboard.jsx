import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Bookmark, BookmarkCheck, Plus, ArrowRight, ClipboardList, Heart, Ticket, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchEvents, fetchRegistrations, fetchSavedEvents, fetchUserStats, fetchMyEvents, deleteEvent } from '../lib/database';
import CalendarWidget from '../components/CalendarWidget';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import bgLight from '../assets/backgrounds/bg_light.png';
import bgDark from '../assets/backgrounds/bg_dark.png';

export default function Dashboard() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({ eventsCreated: 0, ticketsBooked: 0, savedEvents: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (user) loadDashboard(); }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    const [eventsRes, myEventsRes, regsRes, statsRes] = await Promise.all([
      fetchEvents({ limit: 4 }),
      fetchMyEvents(user.id),
      fetchRegistrations(user.id),
      fetchUserStats(user.id),
    ]);
    setEvents(eventsRes.data);
    setMyEvents(myEventsRes.data);
    setRegistrations(regsRes.data);
    setStats(statsRes);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await deleteEvent(deleteTarget.id);
    setDeleting(false);
    if (!error) {
      setDeleteTarget(null);
      // Refresh dashboard data
      loadDashboard();
    }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return { month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), day: date.getDate().toString() };
  };

  const statCards = [
    { label: 'Events Created', value: stats.eventsCreated, icon: ClipboardList, color: 'text-blue-500' },
    { label: 'Saved Events', value: stats.savedEvents, icon: Heart, color: 'text-pink-500' },
    { label: 'Tickets', value: stats.ticketsBooked, icon: Ticket, color: 'text-amber-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div>
          {/* Welcome Banner */}
          <motion.div className="glass-card overflow-hidden relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="absolute inset-0 overflow-hidden">
              <img src={isDark ? bgDark : bgLight} alt="" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/60 dark:from-gray-900/60 to-transparent" />
            </div>
            <div className="relative p-6 sm:p-8">
              <h1 className="font-display text-2xl sm:text-3xl font-bold dark:text-white">Welcome back, {firstName}!</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Discover amazing events happening near you.</p>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {statCards.map((stat, i) => (
                  <motion.div key={stat.label} className="glass-card p-4 flex items-center gap-3 glass-card-hover" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <div>
                      <p className="text-xl font-bold dark:text-white">{stat.value}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* My Created Events */}
          <section className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base dark:text-white">My Created Events</h2>
              <Link to="/create-event" className="text-xs text-purple-500 hover:text-purple-600 font-medium flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Create New
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : myEvents.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No events created yet"
                description="Start by creating your first event."
                actionLabel="Create Event"
                onAction={() => navigate('/create-event')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myEvents.slice(0, 6).map((event, i) => {
                  const { month, day } = formatDate(event.start_date);
                  return (
                    <motion.div
                      key={event.id}
                      className="glass-card glass-card-hover overflow-hidden group relative"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link to={`/event/${event.id}`}>
                        <div className="relative overflow-hidden h-36">
                          <img src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop'} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white bg-purple-500/80 backdrop-blur-md rounded-lg">{event.category}</span>
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex flex-col items-center bg-purple-100 dark:bg-purple-900/30 rounded-lg px-2 py-1 min-w-[40px]">
                              <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase">{month}</span>
                              <span className="text-base font-bold text-purple-700 dark:text-purple-300">{day}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link to={`/event/${event.id}`}><h3 className="font-semibold text-sm truncate dark:text-white">{event.title}</h3></Link>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.location || event.event_type}</p>
                            </div>
                          </div>
                          {/* Delete */}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(event); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Events */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base dark:text-white">Recent Events</h2>
              <Link to="/explore" className="text-xs text-purple-500 hover:text-purple-600 font-medium">View all</Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No events available yet"
                description="Create your first event or explore what others are hosting."
                actionLabel="Create Event"
                onAction={() => navigate('/create-event')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {events.map((event, i) => {
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
                      <Link to={`/event/${event.id}`}>
                        <div className="relative overflow-hidden h-44">
                          <img src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop'} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                            <Link to={`/event/${event.id}`}><h3 className="font-semibold text-sm truncate dark:text-white">{event.title}</h3></Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.location || event.event_type}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* My Registrations */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base dark:text-white">My Upcoming Events</h2>
              <Link to="/my-tickets" className="text-xs text-purple-500 hover:text-purple-600 font-medium">View all</Link>
            </div>

            {registrations.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events. <Link to="/explore" className="text-purple-500 font-medium">Explore events</Link> to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {registrations.slice(0, 4).map((reg, i) => {
                  const ev = reg.events;
                  if (!ev) return null;
                  const { month, day } = formatDate(ev.start_date);
                  return (
                    <motion.div key={reg.id} className="glass-card glass-card-hover overflow-hidden group" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                      <Link to={`/event/${ev.id}`}>
                        <div className="relative overflow-hidden h-40">
                          <img src={ev.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop'} alt={ev.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link to={`/event/${ev.id}`}><h3 className="font-semibold text-sm dark:text-white line-clamp-2">{ev.title}</h3></Link>
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400"><Calendar className="w-3.5 h-3.5" /><span>{month} {day}</span></div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400"><MapPin className="w-3.5 h-3.5" /><span>{ev.location || ev.event_type}</span></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5 hidden xl:block">
          <CalendarWidget />

          {/* Quick Actions */}
          <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="font-display font-bold text-sm dark:text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/create-event" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Plus className="w-4 h-4 text-purple-500" /></div>
                <span className="text-sm font-medium dark:text-gray-300">Create Event</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
              <Link to="/explore" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Calendar className="w-4 h-4 text-blue-500" /></div>
                <span className="text-sm font-medium dark:text-gray-300">Explore Events</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this event?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will remove all registrations, saved bookmarks, and notifications. This action cannot be undone.`}
        confirmLabel="Delete Event"
        loading={deleting}
      />
    </motion.div>
  );
}
