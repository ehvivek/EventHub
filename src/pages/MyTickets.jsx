import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, X, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchRegistrations, unregisterFromEvent } from '../lib/database';
import EmptyState from '../components/EmptyState';

export default function MyTickets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadTickets(); }, [user]);

  const loadTickets = async () => {
    setLoading(true);
    const { data } = await fetchRegistrations(user.id);
    setTickets(data);
    setLoading(false);
  };

  const handleCancel = async (eventId) => {
    await unregisterFromEvent(user.id, eventId);
    setTickets(prev => prev.filter(t => t.event_id !== eventId));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold dark:text-white">My Tickets</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Events you're registered for</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No tickets booked yet"
          description="Explore events and register to see your tickets here."
          actionLabel="Explore Events"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket, i) => {
            const ev = ticket.events;
            if (!ev) return null;
            const isPast = new Date(ev.end_date || ev.start_date) < new Date();
            return (
              <motion.div
                key={ticket.id}
                className={`glass-card overflow-hidden transition-all duration-300 ${isPast ? 'grayscale opacity-60' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex flex-col sm:flex-row">
                  <Link to={`/event/${ev.id}`} className="relative sm:w-48 h-32 sm:h-auto flex-shrink-0">
                    <img
                      src={ev.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop'}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    {isPast && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="px-2 py-1 text-[10px] font-bold text-white bg-gray-700/80 backdrop-blur-md rounded-lg tracking-wider uppercase">Ended</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${isPast ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                            {isPast ? 'Past' : 'Upcoming'}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-full">{ev.category}</span>
                        </div>
                        <Link to={`/event/${ev.id}`}>
                          <h3 className="font-display font-bold text-base dark:text-white hover:text-purple-500 transition-colors">{ev.title}</h3>
                        </Link>
                      </div>
                      {!isPast && (
                        <button
                          onClick={() => handleCancel(ev.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Cancel registration"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(ev.start_date)}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ev.location || ev.event_type}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Registered {formatDate(ticket.created_at)}</p>
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
