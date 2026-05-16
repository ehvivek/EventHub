import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Globe, Users, Bookmark, BookmarkCheck, Ticket, ArrowLeft, Clock, Trash2, ExternalLink, Copy, Check, Link2, ShieldAlert, ClipboardList, X, Search, ChevronRight, Building2, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchEventById, saveEvent, unsaveEvent, isEventSaved, registerForEvent, unregisterFromEvent, isRegistered, getRegistrationCount, createNotification, deleteEvent, fetchEventRegistrationsSimple } from '../lib/database';
import ConfirmModal from '../components/ConfirmModal';

export default function EventDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [attendees, setAttendees] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedWebsite, setCopiedWebsite] = useState(false);
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [showExternalRegModal, setShowExternalRegModal] = useState(false);
  const [showRegsModal, setShowRegsModal] = useState(false);
  const [regsData, setRegsData] = useState([]);
  const [regsLoading, setRegsLoading] = useState(false);
  const [regsSearch, setRegsSearch] = useState('');
  const [expandedReg, setExpandedReg] = useState(null);

  const isCreator = event && user && event.creator_id === user.id;
  const canDelete = isCreator || isAdmin;
  const isOnline = event && (event.event_type === 'Online' || event.event_type === 'Hybrid');
  const isPaid = event && event.ticket_type === 'Paid Event';
  const isEnded = event && new Date(event.end_date || event.start_date) < new Date();

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    const { data } = await fetchEventById(id);
    setEvent(data);
    if (data && user) {
      const [s, r, count] = await Promise.all([
        isEventSaved(user.id, id),
        isRegistered(user.id, id),
        getRegistrationCount(id),
      ]);
      setSaved(s);
      setRegistered(r);
      setAttendees(count);
    }
    setLoading(false);
  };

  const handleToggleSave = async () => {
    if (saved) {
      await unsaveEvent(user.id, id);
      setSaved(false);
    } else {
      await saveEvent(user.id, id);
      setSaved(true);
      await createNotification(user.id, 'save', 'Event Saved', `You saved "${event.title}"`, id);
    }
  };

  const performRegister = async () => {
    setActionLoading(true);
    if (registered) {
      await unregisterFromEvent(user.id, id);
      setRegistered(false);
      setAttendees(a => a - 1);
    } else {
      await registerForEvent(user.id, id);
      setRegistered(true);
      setAttendees(a => a + 1);
      await createNotification(user.id, 'registration', 'Registered!', `You registered for "${event.title}"`, id);
    }
    setActionLoading(false);
  };

  const handleToggleRegister = () => {
    if (registered) {
      // Unregistering — no modal needed
      performRegister();
    } else if (event.registration_link) {
      // External event — show confirmation first
      setShowExternalRegModal(true);
    } else if (isPaid) {
      // Paid event — show confirmation first
      setShowPaidModal(true);
    } else {
      // Free event — register directly
      performRegister();
    }
  };

  const handlePaidConfirm = () => {
    setShowPaidModal(false);
    performRegister();
  };

  const handleExternalRegConfirm = () => {
    setShowExternalRegModal(false);
    performRegister();
  };

  const handleDeleteEvent = async () => {
    setDeleting(true);
    const { error } = await deleteEvent(id);
    setDeleting(false);
    if (!error) {
      setShowDeleteModal(false);
      navigate('/dashboard');
    }
  };

  const handleCopyLink = (link, type) => {
    navigator.clipboard.writeText(link);
    if (type === 'website') {
      setCopiedWebsite(true);
      setTimeout(() => setCopiedWebsite(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-xl font-bold dark:text-white">Event not found</h2>
        <button onClick={() => navigate('/explore')} className="mt-4 text-sm text-purple-500 font-medium">← Back to Explore</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Back + Delete */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {canDelete && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 rounded-xl glass-card hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ${
              isAdmin && !isCreator ? 'border border-red-500/30' : ''
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {isAdmin && !isCreator ? '🛡️ Admin: Delete Event' : 'Delete Event'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
        {/* Main */}
        <div className="space-y-6">
          {/* Banner */}
          <div className={`glass-card overflow-hidden transition-all duration-300 ${isEnded ? 'grayscale' : ''}`}>
            <div className="relative h-56 sm:h-72">
              <img
                src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {/* Event Ended overlay */}
              {isEnded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-5 py-2 text-sm font-bold text-white bg-gray-800/80 backdrop-blur-md rounded-xl tracking-widest uppercase border border-white/20">
                    🏁 Event Ended
                  </span>
                </div>
              )}
              <div className="absolute bottom-4 left-5 right-5">
                <div className="flex items-center gap-2 mb-2">
                  {!isEnded && (
                    <button onClick={() => navigate(`/explore?category=${encodeURIComponent(event.category)}`)} className="px-3 py-1 text-xs font-semibold text-white bg-purple-500/80 hover:bg-purple-600/90 backdrop-blur-md rounded-lg transition-colors cursor-pointer">{event.category}</button>
                  )}
                  {isPaid && !isEnded && (
                    <span className="px-3 py-1 text-xs font-semibold text-white bg-amber-500/80 backdrop-blur-md rounded-lg">Paid</span>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">{event.title}</h1>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-base dark:text-white mb-4">Event Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date + Time combined */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Starts</p>
                  <p className="text-sm font-medium dark:text-white">{formatDate(event.start_date)}</p>
                  <p className="text-xs text-purple-500 font-medium mt-0.5">{formatTime(event.start_date)}</p>
                </div>
              </div>
              {/* End Date + Time combined */}
              {event.end_date && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ends</p>
                    <p className="text-sm font-medium dark:text-white">{formatDate(event.end_date)}</p>
                    <p className="text-xs text-rose-500 font-medium mt-0.5">{formatTime(event.end_date)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  {event.event_type === 'Online' ? <Globe className="w-5 h-5 text-green-500" /> : <MapPin className="w-5 h-5 text-green-500" />}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{event.event_type}</p>
                  <p className="text-sm font-medium dark:text-white">{event.location || 'Online'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Attendees</p>
                  <p className="text-sm font-medium dark:text-white">{attendees} / {event.max_attendees}</p>
                </div>
              </div>
              {event.registration_deadline && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    <Timer className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Registration Deadline</p>
                    <p className="text-sm font-medium dark:text-white">{formatDate(event.registration_deadline)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Official Registration Link - moved to top of sections */}
          {event.registration_link && (
            <motion.div
              className="glass-card p-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="font-display font-bold text-base dark:text-white mb-3">Official Registration Link</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  Please complete your official registration on the organizer's website, then return here to mark yourself as registered.
                </p>
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Official Registration Site
                </a>
              </div>
            </motion.div>
          )}

          {/* Hosting Organization */}
          {(event.organization_name || event.organization_type) && (
            <motion.div
              className="glass-card p-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-display font-bold text-base dark:text-white">Hosting Organization</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Organization Type</p>
                    <p className="text-sm font-medium dark:text-white">{event.organization_type || 'Independent Organizer'}</p>
                  </div>
                  {event.organization_name && (
                    <>
                      <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Organization Name</p>
                        <p className="text-sm font-bold dark:text-white text-indigo-600 dark:text-indigo-400">{event.organization_name}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Official Website */}
          {event.organizer_website && (
            <motion.div
              className="glass-card p-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <h2 className="font-display font-bold text-base dark:text-white">Official Website</h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Visit the official event or organizer website for more details.</p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 font-mono">{event.organizer_website}</span>
                  <button onClick={() => handleCopyLink(event.organizer_website, 'website')} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex-shrink-0" title="Copy link">
                    {copiedWebsite ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                <a href={event.organizer_website.startsWith('http') ? event.organizer_website : `https://${event.organizer_website}`} target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5">
                  <ExternalLink className="w-4 h-4" /> Visit Website
                </a>
              </div>
            </motion.div>
          )}

          {/* Online Event Link */}
          {isOnline && event.event_link && (
            <motion.div
              className="glass-card p-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="w-5 h-5 text-purple-500" />
                  <h2 className="font-display font-bold text-base dark:text-white">Online Event Link</h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {event.event_type === 'Hybrid' ? 'This is a hybrid event. Join online or attend in person.' : 'Join this event online using the link below.'}
                </p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <Link2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 font-mono">{event.event_link}</span>
                  <button onClick={() => handleCopyLink(event.event_link, 'event')} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex-shrink-0" title="Copy link">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                <a href={event.event_link.startsWith('http') ? event.event_link : `https://${event.event_link}`} target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5">
                  <ExternalLink className="w-4 h-4" /> Join Event
                </a>
              </div>
            </motion.div>
          )}


          {/* Description */}
          {event.description && (
            <div className="glass-card p-6">
              <h2 className="font-display font-bold text-base dark:text-white mb-3">About This Event</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {event.tags.map(tag => (
                    <button key={tag} onClick={() => navigate(`/explore?search=${encodeURIComponent(tag)}`)} className="px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/40 rounded-full transition-colors cursor-pointer">{tag}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Actions */}
          <div className="glass-card p-5 sticky top-20">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">{event.ticket_type}</p>
              {isPaid && (
                <span className="px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-full uppercase tracking-wider">Paid</span>
              )}
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={handleToggleRegister}
                disabled={actionLoading}
                className={`w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                  registered
                    ? 'border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    : 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-md hover:shadow-lg'
                }`}
              >
                <Ticket className="w-4 h-4" />
                {registered 
                  ? 'Cancel Registration' 
                  : (event.registration_link ? 'MARK REGISTERED' : 'Register Now')}
              </button>
              <button
                onClick={handleToggleSave}
                className="w-full py-3 text-sm font-medium glass-card flex items-center justify-center gap-2 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
              >
                {saved ? <BookmarkCheck className="w-4 h-4 text-purple-500" /> : <Bookmark className="w-4 h-4" />}
                {saved ? 'Saved' : 'Save Event'}
              </button>

              {/* Creator actions */}
              {isCreator && (
                <>
                  <button
                    onClick={async () => { setShowRegsModal(true); setRegsLoading(true); const { data } = await fetchEventRegistrationsSimple(id); setRegsData(data); setRegsLoading(false); }}
                    className="w-full py-3 text-sm font-medium text-purple-600 dark:text-purple-400 rounded-xl border-2 border-purple-200 dark:border-purple-800/50 flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                  >
                    <ClipboardList className="w-4 h-4" /> View Registrations ({attendees})
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full py-3 text-sm font-medium text-red-500 rounded-xl border-2 border-red-200 dark:border-red-800/50 flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Event
                  </button>
                </>
              )}
              {/* Admin-only moderation controls (non-creator) */}
              {isAdmin && !isCreator && (
                <div className="mt-1 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">🛡️ Admin Moderation</p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full py-2.5 text-sm font-medium text-red-500 rounded-xl border border-red-300 dark:border-red-800/50 flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Event Permanently
                  </button>
                </div>
              )}
            </div>

            {/* Organizer */}
            {event.profiles && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Organized by</p>
                <div className="flex items-center gap-3">
                  <img
                    src={event.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.profiles.full_name || 'U')}&background=8b5cf6&color=fff`}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 dark:border-purple-700"
                  />
                  <div>
                    <p className="text-sm font-semibold dark:text-white">{event.organizer_name || event.profiles.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{event.profiles.username}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Private Organizer Details — Creator Only */}
            {isCreator && event.organizer_contact_email && (
              <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
                <p className="text-xs font-semibold text-purple-400 mb-3 flex items-center gap-1.5">🔒 Your Organizer Details (private)</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Contact Email</span>
                    <span className="dark:text-gray-300 font-medium flex items-center gap-1">
                      {event.organizer_contact_email}
                      <span className="text-green-400 text-[10px] font-semibold bg-green-500/10 px-1.5 py-0.5 rounded-full">✓ Verified</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteEvent}
        title="Delete Event?"
        message={isAdmin && !isCreator
          ? `This action will permanently remove "${event.title}" from EventHub. This cannot be undone.`
          : `Are you sure you want to delete "${event.title}"? This will remove all registrations, saved bookmarks, and notifications. This action cannot be undone.`
        }
        confirmLabel="Delete Permanently"
        loading={deleting}
      />

      {/* External Event Registration Modal */}
      <AnimatePresence>
        {showExternalRegModal && (
          <>
            <motion.div
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExternalRegModal(false)}
            />
            <motion.div
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md p-6 relative shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glow accents */}
                <div className="absolute -top-16 -left-16 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                      <ShieldAlert className="w-7 h-7 text-pink-500" />
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-black dark:text-white text-center">
                    Confirm Registration
                  </h3>
                  <p className="text-sm font-medium text-black/70 dark:text-white/70 text-center mt-3 leading-relaxed">
                    Please confirm that you have officially completed the registration process through the organizer’s official registration link. False confirmations may affect event analytics.
                  </p>

                  <div className="flex items-center gap-3 mt-8">
                    <button
                      onClick={() => setShowExternalRegModal(false)}
                      className="flex-1 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExternalRegConfirm}
                      className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      Confirm Registration
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Paid Event Registration Modal */}
      <AnimatePresence>
        {showPaidModal && (
          <>
            <motion.div
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaidModal(false)}
            />
            <motion.div
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md p-6 relative shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glow accents */}
                <div className="absolute -top-16 -left-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <ShieldAlert className="w-7 h-7 text-amber-500" />
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-black dark:text-white text-center">
                    Paid Event Registration
                  </h3>
                  <p className="text-sm font-medium text-black/70 dark:text-white/70 text-center mt-3 leading-relaxed">
                    Please register only if you have officially completed the required payment or registration process for this event.
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-400 text-center mt-2 font-medium">
                    Unauthorized or false registrations may lead to account restrictions or removal from the event.
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowPaidModal(false)}
                      className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePaidConfirm}
                      className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> I Understand & Continue
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Registrations Viewer Modal */}
      <AnimatePresence>
        {showRegsModal && (
          <>
            <motion.div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRegsModal(false)} />
            <motion.div className="fixed inset-0 z-[101] flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="font-display text-lg font-bold text-black dark:text-white">Registrations</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{regsData.length} attendee{regsData.length !== 1 ? 's' : ''} registered</p>
                  </div>
                  <button onClick={() => setShowRegsModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Search */}
                {regsData.length > 0 && (
                  <div className="px-5 pt-3 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Search attendees..." value={regsSearch} onChange={e => setRegsSearch(e.target.value)} className="bg-transparent text-sm text-black dark:text-white flex-1 outline-none placeholder:text-gray-400" />
                    </div>
                  </div>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-2">
                  {regsLoading ? (
                    <div className="flex justify-center py-8"><div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
                  ) : regsData.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No registrations yet</p>
                    </div>
                  ) : (
                    regsData.filter(r => {
                      if (!regsSearch) return true;
                      const q = regsSearch.toLowerCase();
                      return r.profile?.full_name?.toLowerCase().includes(q) || r.profile?.username?.toLowerCase().includes(q);
                    }).map(reg => (
                      <div key={reg.id} className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 overflow-hidden transition-all">
                        <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" onClick={() => setExpandedReg(expandedReg === reg.id ? null : reg.id)}>
                          <img src={reg.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(reg.profile?.full_name || 'U')}&background=8b5cf6&color=fff`} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 dark:border-purple-700 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-black dark:text-white truncate">{reg.profile?.full_name || 'User'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{reg.profile?.username ? `@${reg.profile.username}` : ''}</p>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedReg === reg.id ? 'rotate-90' : ''}`} />
                        </div>
                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedReg === reg.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                              <div className="px-4 pb-4 pt-1 space-y-2 border-t border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-semibold text-gray-400 uppercase w-20">Full Name</span>
                                  <span className="text-xs text-black dark:text-white font-medium">{reg.profile?.full_name || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-semibold text-gray-400 uppercase w-20">Username</span>
                                  <span className="text-xs text-black dark:text-white font-medium">{reg.profile?.username ? `@${reg.profile.username}` : '—'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-semibold text-gray-400 uppercase w-20">Registered</span>
                                  <span className="text-xs text-black dark:text-white font-medium">{new Date(reg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
