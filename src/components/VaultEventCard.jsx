import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Link as LinkIcon, Heart, Pin, Clock, MoreVertical, Edit2, Trash2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Users, ExternalLink, Maximize2 } from 'lucide-react';

export default function VaultEventCard({ event, onEdit, onDelete, onToggleStatus, onToggleFavorite, onTogglePin, onView }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (event.status === 'completed') {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(event.start_date);
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft('Started');
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        
        let t = '';
        if (d > 0) t += `${d}d `;
        if (h > 0 || d > 0) t += `${h}h `;
        t += `${m}m`;
        setTimeLeft(t);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [event.start_date, event.status]);

  const getImportanceColor = (val) => {
    if (val >= 80) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (val >= 50) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-green-500 bg-green-500/10 border-green-500/20';
  };

  const getLabelColor = (color) => {
    const colors = {
      default: 'bg-white/40 text-gray-700 dark:bg-white/10 dark:text-gray-300 border border-white/30 dark:border-white/10',
      red: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/20',
      blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20',
      green: 'bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/20',
      purple: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20',
      orange: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/20',
    };
    return colors[color] || colors.default;
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative glass-card glass-card-hover group transition-all duration-300 ${event.is_pinned ? 'ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] border-purple-500/50 dark:border-purple-400/50' : ''}`}
    >
      {/* Overflow wrapper for the completed sash */}
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-[1]">
        {event.status === 'completed' && (
          <div className="absolute -left-8 top-4 w-28 bg-red-600 -rotate-45 py-1 text-center shadow-md pointer-events-none">
             <span className="text-[9px] font-bold text-white uppercase tracking-widest">Completed</span>
          </div>
        )}
      </div>


      {/* Header Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-[100]">
        <button 
          onClick={() => onTogglePin(event)}
          className={`p-1.5 rounded-lg backdrop-blur-sm transition-all duration-200 ${event.is_pinned ? 'bg-purple-500/20 text-purple-500 shadow-sm' : 'bg-white/20 dark:bg-white/5 text-gray-400 hover:text-purple-500 hover:bg-purple-500/10'}`}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => onToggleFavorite(event)}
          className={`p-1.5 rounded-lg backdrop-blur-sm transition-all duration-200 ${event.is_favorite ? 'bg-pink-500/20 text-pink-500 shadow-sm' : 'bg-white/20 dark:bg-white/5 text-gray-400 hover:text-pink-500 hover:bg-pink-500/10'}`}
        >
          <Heart className={`w-3.5 h-3.5 ${event.is_favorite ? 'fill-current' : ''}`} />
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg bg-white/20 dark:bg-white/5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-[#1a1128]/95 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgba(139,92,246,0.2)] overflow-hidden z-50 py-1.5"
              >
                <button 
                  onClick={() => { setShowMenu(false); onToggleStatus(event); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/5 transition-colors flex items-center gap-2.5 font-medium"
                >
                  {event.status === 'completed' ? (
                    <><Clock className="w-4 h-4 text-purple-500" /> Mark as Upcoming</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 text-green-500" /> Mark as Completed</>
                  )}
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onEdit(event); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/5 transition-colors flex items-center gap-2.5 font-medium"
                >
                  <Edit2 className="w-4 h-4 text-blue-500" /> Edit Event
                </button>
                <div className="h-px bg-white/30 dark:bg-white/10 mx-3 my-1" />
                <button 
                  onClick={() => { setShowMenu(false); onDelete(event); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors flex items-center gap-2.5 font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Delete Event
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <div className="p-6 relative z-10">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4 pr-28">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-sm ${getLabelColor(event.color_label)}`}>
            {event.color_label === 'default' ? 'VAULT' : event.color_label.toUpperCase()}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm ${getImportanceColor(event.importance)} flex items-center gap-1`}>
            <AlertCircle className="w-3 h-3" />
            {event.importance}%
          </span>
          {event.status === 'upcoming' && timeLeft && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 backdrop-blur-sm flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeLeft}
            </span>
          )}
        </div>

        {/* Title & Desc */}
        <div className="flex items-start gap-2.5 mb-3">
          <button 
            onClick={() => onView && onView(event)}
            className="mt-0.5 p-1.5 rounded-lg bg-white/30 dark:bg-white/5 text-gray-400 hover:text-purple-500 hover:bg-purple-500/15 dark:hover:bg-purple-500/20 transition-all shrink-0 backdrop-blur-sm border border-white/20 dark:border-white/5"
            title="Expand Details"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <h3 className={`font-display text-lg font-bold dark:text-white leading-snug ${!isExpanded ? 'line-clamp-1' : ''} ${event.status === 'completed' ? 'opacity-50 line-through decoration-red-500/50' : ''}`}>
            {event.title}
          </h3>
        </div>
        {event.description && (
          <p className={`text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed ${!isExpanded ? 'line-clamp-2' : 'whitespace-pre-wrap'}`}>
            {event.description}
          </p>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/25 dark:bg-white/[0.03] border border-white/30 dark:border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="font-semibold text-xs text-gray-700 dark:text-gray-300">Date & Time</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
              </p>
              {isExpanded && event.end_date && (
                <p className="text-xs text-gray-400 mt-0.5">
                  → {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/25 dark:bg-white/[0.03] border border-white/30 dark:border-white/5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${event.event_type === 'Online' ? 'bg-gradient-to-br from-blue-500/20 to-blue-500/5' : 'bg-gradient-to-br from-red-500/20 to-red-500/5'}`}>
              {event.event_type === 'Online' ? <LinkIcon className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-red-500" />}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-gray-700 dark:text-gray-300">{event.event_type}</p>
              {event.event_type === 'Online' && event.event_link ? (
                <a href={event.event_link} target="_blank" rel="noopener noreferrer" className={`text-xs text-blue-500 hover:text-blue-400 hover:underline flex items-center gap-1 mt-0.5 ${!isExpanded ? 'truncate block' : 'break-all'}`}>
                  {event.event_link} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              ) : event.event_type === 'Offline' && event.location ? (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className={`text-xs text-blue-500 hover:text-blue-400 hover:underline flex items-start gap-1 mt-0.5 ${!isExpanded ? 'truncate block' : ''}`}>
                  {event.location} <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                </a>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5 italic">Not specified</p>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Organizer Info */}
        {isExpanded && (event.organizer_name || event.organizer_contact || event.organizer_social_link || event.organizer_website) && (
          <div className="mt-4 p-4 rounded-xl bg-white/20 dark:bg-white/[0.03] border border-white/25 dark:border-white/5 backdrop-blur-sm">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-orange-500" /> Organizer
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {event.organizer_name && (
                <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Name</p><p className="text-xs font-medium dark:text-gray-300">{event.organizer_name}</p></div>
              )}
              {event.organizer_contact && (
                <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Contact</p><p className="text-xs font-medium dark:text-gray-300">{event.organizer_contact}</p></div>
              )}
              {event.organizer_social_link && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Social</p>
                  <a href={event.organizer_social_link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-500 hover:underline flex items-center gap-1">
                    Profile <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {event.organizer_website && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Website</p>
                  <a href={event.organizer_website} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-500 hover:underline flex items-center gap-1 truncate">
                    {(() => { try { return new URL(event.organizer_website).hostname.replace('www.',''); } catch { return event.organizer_website; } })()} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes Preview */}
        {event.notes && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/[0.03] border border-amber-500/10 dark:border-amber-500/5">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold mb-1 uppercase tracking-wider">Notes</p>
            <p className={`text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed ${!isExpanded ? 'line-clamp-2' : 'whitespace-pre-wrap'}`}>"{event.notes}"</p>
          </div>
        )}

        {/* Expand Toggle */}
        <div className="mt-4 pt-3 border-t border-white/20 dark:border-white/5 flex justify-center">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-purple-500 transition-colors group/expand"
          >
            {isExpanded ? (
              <><ChevronUp className="w-4 h-4 group-hover/expand:-translate-y-0.5 transition-transform" /> Show Less</>
            ) : (
              <><ChevronDown className="w-4 h-4 group-hover/expand:translate-y-0.5 transition-transform" /> View Details</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
