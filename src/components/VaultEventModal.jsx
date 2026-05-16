import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Link as LinkIcon, Info, Users, Flag, Save, Loader2, AlertCircle } from 'lucide-react';

const COLORS = [
  { id: 'default', bg: 'bg-gray-200 dark:bg-gray-700' },
  { id: 'red', bg: 'bg-red-500' },
  { id: 'blue', bg: 'bg-blue-500' },
  { id: 'green', bg: 'bg-green-500' },
  { id: 'purple', bg: 'bg-purple-500' },
  { id: 'orange', bg: 'bg-orange-500' },
];

export default function VaultEventModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    registered_date: '',
    event_type: 'Online',
    event_link: '',
    location: '',
    organizer_name: '',
    organizer_contact: '',
    organizer_social_link: '',
    organizer_website: '',
    importance: 50,
    color_label: 'default',
    notes: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData && isOpen) {
      const sDate = new Date(initialData.start_date);
      const eDate = initialData.end_date ? new Date(initialData.end_date) : null;
      const rDate = initialData.registered_date ? new Date(initialData.registered_date) : null;

      setForm({
        ...initialData,
        start_date: sDate.toISOString().split('T')[0],
        start_time: sDate.toTimeString().slice(0, 5),
        end_date: eDate ? eDate.toISOString().split('T')[0] : '',
        end_time: eDate ? eDate.toTimeString().slice(0, 5) : '',
        registered_date: rDate ? rDate.toISOString().split('T')[0] : '',
      });
    } else if (isOpen) {
      setForm({
        title: '', description: '',
        start_date: '', start_time: '',
        end_date: '', end_time: '',
        registered_date: '',
        event_type: 'Online', event_link: '', location: '',
        organizer_name: '', organizer_contact: '', organizer_social_link: '', organizer_website: '',
        importance: 50, color_label: 'default', notes: ''
      });
      setError('');
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.start_date || !form.start_time) {
      setError('Title, Start Date, and Start Time are required.');
      return;
    }
    setError('');
    setSaving(true);

    try {
      const startDateTime = new Date(`${form.start_date}T${form.start_time}:00`).toISOString();
      let endDateTime = null;
      if (form.end_date && form.end_time) {
        endDateTime = new Date(`${form.end_date}T${form.end_time}:00`).toISOString();
      }
      let regDateTime = null;
      if (form.registered_date) {
        regDateTime = new Date(`${form.registered_date}T00:00:00`).toISOString();
      }

      const submissionData = {
        title: form.title,
        description: form.description,
        start_date: startDateTime,
        end_date: endDateTime,
        registered_date: regDateTime,
        event_type: form.event_type,
        event_link: form.event_type === 'Online' ? form.event_link : '',
        location: form.event_type === 'Offline' ? form.location : '',
        organizer_name: form.organizer_name,
        organizer_contact: form.organizer_contact,
        organizer_social_link: form.organizer_social_link,
        organizer_website: form.organizer_website,
        importance: parseInt(form.importance),
        color_label: form.color_label,
        notes: form.notes
      };

      await onSave(submissionData, initialData?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
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
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card shadow-[0_20px_60px_rgba(139,92,246,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/30 dark:border-white/10 custom-scrollbar"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/20 dark:border-white/5 glass-navbar rounded-t-[inherit]">
            <h2 className="text-xl font-display font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/25 to-pink-500/25 flex items-center justify-center">
                <Save className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              {initialData ? 'Edit Vault Event' : 'Add to Custom Vault'}
            </h2>
            <button onClick={onClose} className="p-2.5 rounded-xl bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 transition-all text-gray-500 dark:text-gray-400 border border-white/20 dark:border-white/5 backdrop-blur-sm">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
              </div>
            )}

            {/* Basic Details */}
            <section className="space-y-5">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5 text-purple-500" />
                </div>
                Basic Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Event Name <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" placeholder="e.g., Apple WWDC 2026" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full glass-input px-4 py-3.5 text-sm resize-none" placeholder="Brief details about the event" />
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />

            {/* Timings */}
            <section className="space-y-5">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-pink-500" />
                </div>
                Timings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Start Time <span className="text-red-500">*</span></label>
                  <input type="time" name="start_time" value={form.start_time} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">End Date</label>
                  <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">End Time</label>
                  <input type="time" name="end_time" value={form.end_time} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Registered On</label>
                  <input type="date" name="registered_date" value={form.registered_date} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" />
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />

            {/* Event Type & Location */}
            <section className="space-y-5">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                </div>
                Event Type & Location
              </h3>
              <div className="flex gap-3 p-1.5 rounded-2xl bg-white/20 dark:bg-white/[0.03] border border-white/25 dark:border-white/5">
                <button type="button" onClick={() => setForm(f => ({ ...f, event_type: 'Online' }))} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 ${form.event_type === 'Online' ? 'glass-card text-purple-600 dark:text-purple-400 shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                  <LinkIcon className="w-4 h-4" /> Online
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, event_type: 'Offline' }))} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 ${form.event_type === 'Offline' ? 'glass-card text-purple-600 dark:text-purple-400 shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                  <MapPin className="w-4 h-4" /> Offline
                </button>
              </div>
              <div>
                {form.event_type === 'Online' ? (
                  <>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Meeting Link</label>
                    <input type="url" name="event_link" value={form.event_link} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" placeholder="https://zoom.us/j/..." />
                  </>
                ) : (
                  <>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Venue Address</label>
                    <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" placeholder="Full physical address" />
                  </>
                )}
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />

            {/* Organizer Details */}
            <section className="space-y-5">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-orange-500" />
                </div>
                Organizer <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/5 ml-1 normal-case tracking-normal">Optional</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="organizer_name" value={form.organizer_name} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" placeholder="Organizer Name" />
                <input type="text" name="organizer_contact" value={form.organizer_contact} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" placeholder="Email or Phone" />
                <input type="url" name="organizer_social_link" value={form.organizer_social_link} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" placeholder="Social Link" />
                <input type="url" name="organizer_website" value={form.organizer_website} onChange={handleChange} className="w-full glass-input px-4 py-3.5 text-sm" placeholder="Website URL" />
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />

            {/* Premium Options */}
            <section className="space-y-6">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                  <Flag className="w-3.5 h-3.5 text-green-500" />
                </div>
                Premium Options
              </h3>
              
              <div className="p-5 rounded-2xl bg-white/15 dark:bg-white/[0.03] border border-white/25 dark:border-white/5 backdrop-blur-sm">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <label className="text-sm font-bold text-gray-800 dark:text-white block">Importance Level</label>
                    <span className="text-xs text-gray-500">Drag to set priority (1–100%)</span>
                  </div>
                  <div className={`text-3xl font-display font-black tracking-tighter ${form.importance >= 80 ? 'text-red-500' : form.importance >= 50 ? 'text-orange-500' : 'text-green-500'}`}>
                    {form.importance}%
                  </div>
                </div>
                <input 
                  type="range" min="1" max="100" name="importance" value={form.importance} onChange={handleChange}
                  className="w-full h-2.5 rounded-full appearance-none cursor-pointer accent-purple-500 bg-white/30 dark:bg-white/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-3 block uppercase tracking-wide">Color Label</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {COLORS.map(c => (
                      <button 
                        key={c.id} type="button" onClick={() => setForm(f => ({ ...f, color_label: c.id }))}
                        className={`w-9 h-9 rounded-full ${c.bg} transition-all ${form.color_label === c.id ? 'scale-125 ring-4 ring-purple-500/30 dark:ring-purple-400/30 shadow-lg' : 'opacity-40 hover:opacity-100 hover:scale-110'}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Private Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full glass-input px-4 py-3.5 text-sm resize-none" placeholder="Any private notes..." />
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-6 border-t border-white/20 dark:border-white/5 flex justify-end gap-3 sticky bottom-0 glass-navbar p-6 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 sm:p-8 rounded-b-[inherit]">
              <button type="button" onClick={onClose} disabled={saving} className="px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/5 rounded-xl transition-all border border-white/20 dark:border-white/5">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="glass-button px-8 py-3 text-sm font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save to Vault</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
