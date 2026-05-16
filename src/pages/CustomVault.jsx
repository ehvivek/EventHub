import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Plus, Search, Calendar as CalendarIcon, CheckCircle, Flame, Star, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchVaultEvents, createVaultEvent, updateVaultEvent, deleteVaultEvent } from '../lib/database';
import VaultEventCard from '../components/VaultEventCard';
import VaultEventModal from '../components/VaultEventModal';
import VaultEventViewModal from '../components/VaultEventViewModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import OrbitAnimation from '../components/OrbitAnimation';

export default function CustomVault() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_asc');
  const [filter, setFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [viewingEvent, setViewingEvent] = useState(null);

  useEffect(() => {
    if (user) loadEvents();
  }, [user]);

  const loadEvents = async () => {
    setLoading(true);
    const { data } = await fetchVaultEvents(user.id);
    setEvents(data || []);
    setLoading(false);
  };

  const handleSaveEvent = async (eventData, eventId) => {
    if (eventId) {
      await updateVaultEvent(eventId, eventData);
    } else {
      await createVaultEvent({ ...eventData, user_id: user.id });
    }
    await loadEvents();
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDeleteEvent = (event) => {
    setDeleteTarget(event);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteVaultEvent(deleteTarget.id);
      setEvents(prev => prev.filter(e => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = async (event) => {
    const newStatus = event.status === 'completed' ? 'upcoming' : 'completed';
    await updateVaultEvent(event.id, { status: newStatus });
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: newStatus } : e));
  };

  const handleToggleFavorite = async (event) => {
    await updateVaultEvent(event.id, { is_favorite: !event.is_favorite });
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_favorite: !e.is_favorite } : e));
  };

  const handleTogglePin = async (event) => {
    await updateVaultEvent(event.id, { is_pinned: !event.is_pinned });
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_pinned: !e.is_pinned } : e));
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  // Derived state
  const stats = useMemo(() => {
    return {
      total: events.length,
      upcoming: events.filter(e => e.status === 'upcoming').length,
      completed: events.filter(e => e.status === 'completed').length,
      important: events.filter(e => e.importance >= 80).length
    };
  }, [events]);

  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
    }

    // Filter
    if (filter === 'upcoming') result = result.filter(e => e.status === 'upcoming');
    if (filter === 'completed') result = result.filter(e => e.status === 'completed');
    if (filter === 'favorites') result = result.filter(e => e.is_favorite);
    if (filter === 'important') result = result.filter(e => e.importance >= 80);

    // Sort
    result.sort((a, b) => {
      // Pinned always on top
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      if (sort === 'date_asc') return new Date(a.start_date) - new Date(b.start_date);
      if (sort === 'date_desc') return new Date(b.start_date) - new Date(a.start_date);
      if (sort === 'importance_desc') return b.importance - a.importance;
      if (sort === 'importance_asc') return a.importance - b.importance;
      return 0;
    });

    return result;
  }, [events, search, sort, filter]);

  const filterTabs = [
    { key: 'all', label: 'All', icon: null },
    { key: 'upcoming', label: 'Upcoming', icon: CalendarIcon },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
    { key: 'favorites', label: 'Favorites', icon: Star },
    { key: 'important', label: 'Priority', icon: Flame },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <VaultEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveEvent}
        initialData={editingEvent}
      />
      
      <VaultEventViewModal 
        isOpen={!!viewingEvent}
        onClose={() => setViewingEvent(null)}
        event={viewingEvent}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}" from your vault? This action cannot be undone.`}
        confirmLabel="Delete"
      />

      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8 relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
        
        {/* Background Decorative Orbit */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.07] pointer-events-none hidden md:block">
          <OrbitAnimation />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-extrabold dark:text-white tracking-tight">Custom Vault</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your secure, private event management space.</p>
              </div>
            </div>
            
            {/* Stat Pills */}
            <div className="flex items-center gap-3 mt-5">
              {[
                { label: 'Upcoming', value: stats.upcoming, color: 'from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20' },
                { label: 'Completed', value: stats.completed, color: 'from-green-500/20 to-green-500/5 text-green-600 dark:text-green-400 border-green-500/20' },
                { label: 'High Priority', value: stats.important, color: 'from-red-500/20 to-red-500/5 text-red-600 dark:text-red-400 border-red-500/20' },
              ].map(stat => (
                <div key={stat.label} className={`px-4 py-2.5 rounded-2xl bg-gradient-to-br ${stat.color} border backdrop-blur-sm`}>
                  <p className="text-xl font-display font-extrabold">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={openCreateModal}
            className="w-full md:w-auto glass-button px-7 py-4 text-sm font-bold rounded-2xl flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add to Vault
          </button>
        </div>
      </motion.div>

      {/* Controls Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
        {/* Search + Sort row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search your vault..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 glass-input text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="glass-input px-4 py-3.5 text-sm font-semibold cursor-pointer">
              <option value="date_asc">Earliest First</option>
              <option value="date_desc">Latest First</option>
              <option value="importance_desc">Highest Priority</option>
              <option value="importance_asc">Lowest Priority</option>
            </select>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {filterTabs.map(tab => (
            <button 
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`${filter === tab.key ? 'category-pill-active' : 'category-pill'} flex items-center gap-1.5 whitespace-nowrap`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              {tab.label}
              {tab.key !== 'all' && (
                <span className={`text-[10px] font-bold ml-0.5 ${filter === tab.key ? 'opacity-80' : 'opacity-50'}`}>
                  {tab.key === 'upcoming' ? stats.upcoming : tab.key === 'completed' ? stats.completed : tab.key === 'favorites' ? events.filter(e => e.is_favorite).length : stats.important}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card h-72 animate-pulse" />
          ))}
        </div>
      ) : filteredAndSortedEvents.length === 0 ? (
        <EmptyState 
          icon={Lock}
          title={search || filter !== 'all' ? "No matching events found" : "Your Vault is empty"}
          message={search || filter !== 'all' ? "Try adjusting your search or filters." : "Start organizing your personal events by adding them to your secure Custom Vault."}
          action={(!search && filter === 'all') ? { label: "Add First Event", onClick: openCreateModal } : null}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedEvents.map(event => (
              <VaultEventCard 
                key={event.id} 
                event={event} 
                onView={setViewingEvent}
                onEdit={openEditModal}
                onDelete={handleDeleteEvent}
                onToggleStatus={handleToggleStatus}
                onToggleFavorite={handleToggleFavorite}
                onTogglePin={handleTogglePin}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
