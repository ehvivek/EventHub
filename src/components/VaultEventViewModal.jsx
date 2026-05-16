import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Link as LinkIcon, Users, ExternalLink, Shield, Clock, AlertCircle } from 'lucide-react';

export default function VaultEventViewModal({ isOpen, onClose, event }) {
  if (!event) return null;

  const getImportanceColor = (val) => {
    if (val >= 80) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (val >= 50) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-green-500 bg-green-500/10 border-green-500/20';
  };

  const getLabelColor = (color) => {
    const map = {
      default: 'bg-white/40 text-gray-700 dark:bg-white/10 dark:text-gray-300',
      red: 'bg-red-500/15 text-red-700 dark:text-red-300',
      blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
      green: 'bg-green-500/15 text-green-700 dark:text-green-300',
      purple: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
      orange: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
    };
    return map[color] || map.default;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 py-6 sm:px-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-lg" 
            onClick={onClose} 
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card shadow-[0_20px_60px_rgba(139,92,246,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/30 dark:border-white/10 custom-scrollbar"
          >
            {/* Close button */}
            <button onClick={onClose} className="absolute top-6 right-6 p-2.5 rounded-xl bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 transition-all text-gray-600 dark:text-gray-300 z-10 backdrop-blur-sm border border-white/20 dark:border-white/5">
              <X className="w-5 h-5" />
            </button>

            {/* Colored Header Banner */}
            <div className="relative p-8 pb-6 border-b border-white/20 dark:border-white/5">
              {/* Subtle gradient glow behind header */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-transparent dark:from-purple-500/10 dark:via-pink-500/5 dark:to-transparent rounded-t-[inherit]" />
              
              <div className="relative">
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20 dark:border-white/5 ${getLabelColor(event.color_label)}`}>
                    {event.color_label === 'default' ? 'Custom Vault' : event.color_label}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-sm flex items-center gap-1 ${getImportanceColor(event.importance)}`}>
                    <AlertCircle className="w-3 h-3" /> {event.importance}% Priority
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1 border ${event.status === 'completed' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'}`}>
                    <Clock className="w-3 h-3" />
                    {event.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </span>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight pr-12">{event.title}</h1>
                {event.description && (
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base mt-4">
                    {event.description}
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Date & Time */}
                <div className="p-6 rounded-2xl bg-white/20 dark:bg-white/[0.03] border border-white/25 dark:border-white/5 backdrop-blur-sm">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-purple-500" />
                    </div>
                    Date & Time
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Starts</p>
                      <p className="text-gray-900 dark:text-white font-semibold text-lg">
                        {new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    {event.end_date && (
                      <div className="pt-4 border-t border-white/20 dark:border-white/5">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Ends</p>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                          {new Date(event.end_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="p-6 rounded-2xl bg-white/20 dark:bg-white/[0.03] border border-white/25 dark:border-white/5 backdrop-blur-sm">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${event.event_type === 'Online' ? 'bg-gradient-to-br from-blue-500/20 to-blue-500/5' : 'bg-gradient-to-br from-red-500/20 to-red-500/5'}`}>
                      {event.event_type === 'Online' ? <LinkIcon className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-red-500" />} 
                    </div>
                    {event.event_type} Event
                  </h3>
                  <div>
                    {event.event_type === 'Online' && event.event_link ? (
                      <a href={event.event_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-500/20 transition-all break-all text-sm">
                        Join Meeting <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      </a>
                    ) : event.event_type === 'Offline' && event.location ? (
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium text-base mb-3">{event.location}</p>
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-500/20 transition-all text-sm">
                          View on Maps <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm">No location details provided.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Organizer & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Organizer */}
                <div className="p-6 rounded-2xl bg-white/20 dark:bg-white/[0.03] border border-white/25 dark:border-white/5 backdrop-blur-sm">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
                      <Users className="w-4 h-4 text-orange-500" />
                    </div>
                    Organizer
                  </h3>
                  {(event.organizer_name || event.organizer_contact || event.organizer_website || event.organizer_social_link) ? (
                    <div className="space-y-4">
                      {event.organizer_name && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Name</p>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{event.organizer_name}</p>
                        </div>
                      )}
                      {event.organizer_contact && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Contact</p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{event.organizer_contact}</p>
                        </div>
                      )}
                      {event.organizer_website && (
                        <a href={event.organizer_website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {event.organizer_social_link && (
                        <a href={event.organizer_social_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                          Social <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No organizer details.</p>
                  )}
                </div>

                {/* Notes */}
                <div className="md:col-span-2 p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/[0.03] border border-amber-500/10 dark:border-amber-500/5 backdrop-blur-sm">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-500" />
                    </div>
                    Private Notes
                  </h3>
                  {event.notes ? (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic leading-relaxed text-sm">
                      {event.notes}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic text-sm">No private notes attached.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
