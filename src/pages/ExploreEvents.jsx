import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Bookmark, BookmarkCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchEvents, saveEvent, unsaveEvent, fetchSavedEvents } from '../lib/database';
import EmptyState from '../components/EmptyState';

const categories = ['All', 'Tech', 'Music', 'Startup', 'Gaming', 'Workshops', 'Design', 'Business', 'Other'];

export default function ExploreEvents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('date');
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) setCategory(urlCategory);
    
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) setSearch(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    loadEvents();
  }, [category, sort]);

  useEffect(() => {
    if (user) loadSaved();
  }, [user]);

  const loadEvents = async () => {
    setLoading(true);
    const { data } = await fetchEvents({ category, search: search || undefined, sort });
    setEvents(data);
    setLoading(false);
  };

  const loadSaved = async () => {
    const { data } = await fetchSavedEvents(user.id);
    setSavedIds(new Set(data.map(s => s.event_id)));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadEvents();
  };

  const toggleSave = async (eventId) => {
    if (savedIds.has(eventId)) {
      await unsaveEvent(user.id, eventId);
      setSavedIds(prev => { const s = new Set(prev); s.delete(eventId); return s; });
    } else {
      await saveEvent(user.id, eventId);
      setSavedIds(prev => new Set(prev).add(eventId));
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // An event is "ended" if end_date is past, or start_date is past when no end_date
  const isEnded = (event) => {
    const ref = event.end_date || event.start_date;
    if (!ref) return false;
    return new Date(ref) < new Date();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold dark:text-white">Explore Events</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discover amazing events happening around you</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 glass-input text-sm"
          />
        </form>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="glass-input px-4 py-2.5 text-sm min-w-[160px]"
        >
          <option value="date">Sort by Date</option>
          <option value="popular">Sort by Latest</option>
        </select>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              category === cat ? 'category-pill-active' : 'category-pill'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={category !== 'All' ? `No events available in ${category} yet` : "No events available yet"}
          description="Be the first to create an event and bring people together!"
          actionLabel="Create Event"
          onAction={() => navigate('/create-event')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event, i) => {
            const ended = isEnded(event);
            return (
              <motion.div
                key={event.id}
                className={`glass-card glass-card-hover overflow-hidden cursor-pointer group transition-all duration-300 ${
                  ended ? 'grayscale opacity-60 hover:opacity-75' : ''
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: ended ? 0 : -4 }}
              >
                <Link to={`/event/${event.id}`}>
                  <div className="relative overflow-hidden h-44">
                    <img
                      src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Category badge */}
                    {!ended && (
                      <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white bg-purple-500/80 backdrop-blur-md rounded-lg">
                        {event.category}
                      </span>
                    )}
                    {/* Ended overlay badge */}
                    {ended && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                        <span className="px-3 py-1 text-xs font-bold text-white bg-gray-700/80 backdrop-blur-md rounded-lg tracking-wider uppercase">
                          Event Ended
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/event/${event.id}`} className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate dark:text-white">{event.title}</h3>
                    </Link>
                    {!ended && (
                      <button
                        onClick={() => toggleSave(event.id)}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        {savedIds.has(event.id)
                          ? <BookmarkCheck className="w-4 h-4 text-purple-500" />
                          : <Bookmark className="w-4 h-4 text-gray-400" />
                        }
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(event.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{event.location || event.event_type}</span>
                  </div>
                  {event.profiles && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                      <img
                        src={event.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.profiles.full_name || 'U')}&background=8b5cf6&color=fff&size=24`}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">by {event.profiles.full_name || 'Organizer'}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
