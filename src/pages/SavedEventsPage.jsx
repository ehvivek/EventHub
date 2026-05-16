import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, BookmarkX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchSavedEvents, unsaveEvent } from '../lib/database';
import EmptyState from '../components/EmptyState';

export default function SavedEventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadSaved(); }, [user]);

  const loadSaved = async () => {
    setLoading(true);
    const { data } = await fetchSavedEvents(user.id);
    setSaved(data);
    setLoading(false);
  };

  const handleUnsave = async (eventId) => {
    await unsaveEvent(user.id, eventId);
    setSaved(prev => prev.filter(s => s.event_id !== eventId));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold dark:text-white">Saved Events</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Events you've bookmarked for later</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : saved.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved events yet"
          description="Browse events and save the ones you're interested in."
          actionLabel="Explore Events"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((item, i) => {
            const ev = item.events;
            if (!ev) return null;
            const ended = new Date(ev.end_date || ev.start_date) < new Date();
            return (
              <motion.div
                key={item.id}
                className={`glass-card glass-card-hover overflow-hidden group transition-all duration-300 ${ended ? 'grayscale opacity-60 hover:opacity-75' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/event/${ev.id}`}>
                  <div className="relative overflow-hidden h-40">
                    <img
                      src={ev.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop'}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {!ended && (
                      <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white bg-purple-500/80 backdrop-blur-md rounded-lg">{ev.category}</span>
                    )}
                    {ended && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="px-3 py-1 text-xs font-bold text-white bg-gray-700/80 backdrop-blur-md rounded-lg tracking-wider uppercase">Event Ended</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/event/${ev.id}`} className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate dark:text-white hover:text-purple-500 transition-colors">{ev.title}</h3>
                    </Link>
                    <button
                      onClick={() => handleUnsave(ev.id)}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove from saved"
                    >
                      <BookmarkX className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(ev.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{ev.location || ev.event_type}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
