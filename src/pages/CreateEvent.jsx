import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, Clock, MapPin, Globe, Calendar, Image, Loader2, CheckCircle, Send, Shield, Phone, Mail, User, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createEvent, uploadEventBanner, createNotification, getEventCountToday, checkDuplicateEvent, sanitizeEventInput } from '../lib/database';
import { sendEventPublishedEmail } from '../lib/emailService';
import OtpVerificationModal from '../components/OtpVerificationModal';
import { validateOrganizerEmail } from '../lib/emailValidator';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [form, setForm] = useState({
    title: '',
    short_description: '',
    description: '',
    category: 'Tech',
    tags: '',
    event_type: 'Online',
    ticket_type: 'Free Event',
    location: '',
    event_link: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    timezone: 'Asia/Kolkata (GMT +5:30)',
    max_attendees: 100,
    registration_deadline: '',
    organizer_name: user?.user_metadata?.full_name || '',
    organizer_email: user?.email || '',
    organizer_website: '',
    organizer_contact_email: '',
    registration_link: '',
    organization_type: 'Independent Organizer',
    organization_name: '',
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [bannerError, setBannerError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailVerified, setEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [emailValidation, setEmailValidation] = useState({ valid: null, reason: '', trust: null });
  const [dailyLimitInfo, setDailyLimitInfo] = useState(null);

  // Check daily limit on mount
  useEffect(() => {
    if (user) {
      getEventCountToday(user.id).then(info => setDailyLimitInfo(info));
    }
  }, [user]);

  // Admin bypass: auto-verify email and skip limit display
  useEffect(() => {
    if (isAdmin) {
      setEmailVerified(true);
    }
  }, [isAdmin]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const processFile = (file) => {
    setBannerError('');
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setBannerError('Image size should be less than 5MB');
      return;
    }
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setBannerError('Only JPG, PNG, and WebP are supported');
      return;
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleBanner = (e) => {
    processFile(e.target.files?.[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.start_date) errs.start_date = 'Start date is required';
    if (!form.start_time) errs.start_time = 'Start time is required';
    if (!form.organizer_name.trim()) errs.organizer_name = 'Organizer name is required';
    // Admin bypasses email domain restriction and OTP verification
    if (!isAdmin) {
      if (!form.organizer_contact_email.trim()) {
        errs.organizer_contact_email = 'Contact email is required';
      } else {
        const emailCheck = validateOrganizerEmail(form.organizer_contact_email);
        if (!emailCheck.valid) errs.organizer_contact_email = emailCheck.reason;
      }
      if (!emailVerified) errs.email_verified = 'Email verification is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;
    setPublishing(true);

    try {
      // 1. Check daily limit — skipped for admin
      if (!isAdmin) {
        const limitCheck = await getEventCountToday(user.id);
        if (limitCheck.remaining <= 0) {
          throw new Error('Daily event creation limit reached. Please try again tomorrow.');
        }
      }

      // 2. Check duplicate
      const dupCheck = await checkDuplicateEvent(user.id, form.title);
      if (dupCheck.isDuplicate) {
        throw new Error(`You already have a published event with this title.`);
      }

      // 3. Anti-spam validation
      const sanitizeResult = sanitizeEventInput({
        ...form,
        organizer_contact_email: form.organizer_contact_email,
      });
      if (!sanitizeResult.valid) {
        throw new Error(sanitizeResult.issues.join('. '));
      }

      const startDateTime = new Date(`${form.start_date}T${form.start_time}`).toISOString();
      const endDateTime = form.end_date && form.end_time ? new Date(`${form.end_date}T${form.end_time}`).toISOString() : null;
      const regDeadline = form.registration_deadline ? new Date(form.registration_deadline).toISOString() : null;

      // 4. Upload Banner
      let uploadedBannerUrl = null;
      if (bannerFile) {
        const { url, error: bannerUploadError } = await uploadEventBanner(user.id, bannerFile);
        if (bannerUploadError) throw new Error('Failed to upload banner. Please try again.');
        uploadedBannerUrl = url;
      }

      // 5. Create Event
      const eventData = {
        creator_id: user.id,
        title: form.title,
        short_description: form.short_description,
        description: form.description,
        category: form.category,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        event_type: form.event_type,
        ticket_type: form.ticket_type,
        location: form.location,
        event_link: form.event_link,
        start_date: startDateTime,
        end_date: endDateTime,
        timezone: form.timezone,
        max_attendees: parseInt(form.max_attendees) || 100,
        registration_deadline: regDeadline,
        registration_link: form.registration_link,
        organizer_name: form.organizer_name,
        organizer_email: form.organizer_email,
        organizer_website: form.organizer_website,
        organizer_contact_email: form.organizer_contact_email,
        phone_verified: emailVerified,
        organization_type: form.organization_type,
        organization_name: form.organization_name,
        banner_url: uploadedBannerUrl,
      };

      const { data: newEvent, error } = await createEvent(eventData);
      if (error) throw error;

      // 6. Notification
      await createNotification(user.id, 'event', 'Event Published!', `Your event "${form.title}" is now live.`, newEvent.id);

      // 7. Admin email (non-blocking)
      sendEventPublishedEmail(
        { title: form.title, category: form.category, eventType: form.event_type, dateTime: startDateTime, eventId: newEvent.id, createdAt: new Date().toISOString() },
        { accountEmail: user.email, userId: user.id, fullName: form.organizer_name, contactEmail: form.organizer_contact_email, organizationType: form.organization_type, organizationName: form.organization_name }
      ).catch(err => console.warn('[Email] Admin notification failed:', err));

      navigate(`/event/${newEvent.id}`);
    } catch (err) {
      console.error('Error creating event:', err);
      setErrors({ general: err.message || 'Failed to create event' });
    }
    setPublishing(false);
  };

  const handleClear = () => {
    setForm({
      title: '', short_description: '', description: '', category: 'Tech', tags: '',
      event_type: 'Online', ticket_type: 'Free Event', location: '', event_link: '',
      start_date: '', start_time: '', end_date: '', end_time: '',
      timezone: 'Asia/Kolkata (GMT +5:30)', max_attendees: 100, registration_deadline: '',
      organizer_name: user?.user_metadata?.full_name || '', organizer_email: user?.email || '', organizer_website: '',
      organizer_contact_email: '', registration_link: '',
      organization_type: 'Independent Organizer', organization_name: '',
    });
    setBannerFile(null);
    setBannerPreview('');
    setErrors({});
    setEmailVerified(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/20 dark:hover:bg-white/5"><ArrowLeft className="w-5 h-5 dark:text-white" /></button>
          <div>
            <h1 className="font-display text-2xl font-bold dark:text-white">Create Event</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the details below to create your event.</p>
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="mb-4 p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 backdrop-blur-sm rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {dailyLimitInfo && dailyLimitInfo.remaining <= 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 text-sm bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm rounded-xl flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-amber-300 font-semibold">Daily event creation limit reached</p>
            <p className="text-amber-400/70 text-xs mt-0.5">You've created {dailyLimitInfo.limit} events today. Please try again tomorrow.</p>
          </div>
        </motion.div>
      )}

      {dailyLimitInfo && dailyLimitInfo.remaining > 0 && dailyLimitInfo.remaining <= 2 && (
        <div className="mb-4 p-3 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm rounded-xl flex items-center gap-2">
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span>{dailyLimitInfo.remaining} event{dailyLimitInfo.remaining === 1 ? '' : 's'} remaining today</span>
        </div>
      )}

      <div className="space-y-6 max-w-3xl">
        {/* Banner */}
        <div className="glass-card p-6">
          <h2 className="font-display font-bold text-sm dark:text-white mb-1">1. Event Banner</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Upload a banner image that represents your event.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/10' : 'border-purple-200 dark:border-purple-800 hover:border-purple-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className={`w-8 h-8 mb-3 ${dragActive ? 'text-purple-500' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP. Max 5MB.</p>
              <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleBanner} className="hidden" />
            </label>
            <div className="relative rounded-xl overflow-hidden min-h-[160px] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center">
              {bannerPreview ? (
                <>
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover absolute inset-0" />
                  <button 
                    onClick={(e) => { e.preventDefault(); setBannerFile(null); setBannerPreview(''); }}
                    className="absolute top-2 right-2 bg-black/50 backdrop-blur-md p-1.5 rounded-full text-white hover:bg-red-500 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-45" /> {/* Close icon using ArrowLeft rotated or similar */}
                  </button>
                  {publishing && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-4">
                  <Image className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No banner selected</p>
                </div>
              )}
            </div>
          </div>
          {bannerError && (
            <div className="mt-3 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl glass-card flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {bannerError}
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="glass-card p-6">
          <h2 className="font-display font-bold text-sm dark:text-white mb-4">2. Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold dark:text-gray-300">Event Title *</label>
              <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Enter event title" className={`mt-1 w-full glass-input px-4 py-2.5 text-sm ${errors.title ? 'ring-2 ring-red-400' : ''}`} />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold dark:text-gray-300">Category *</label>
              <select value={form.category} onChange={e => handleChange('category', e.target.value)} className="mt-1 w-full glass-input px-4 py-2.5 text-sm">
                {['Tech','Music','Startup','Gaming','Workshops','Design','Business','Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold dark:text-gray-300">Short Description</label>
              <input type="text" value={form.short_description} onChange={e => handleChange('short_description', e.target.value)} placeholder="Write a short description" className="mt-1 w-full glass-input px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold dark:text-gray-300">Tags</label>
              <input type="text" value={form.tags} onChange={e => handleChange('tags', e.target.value)} placeholder="AI, Workshop, Networking" className="mt-1 w-full glass-input px-4 py-2.5 text-sm" />
            </div>
          </div>
        </div>

        {/* Date/Time + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-sm dark:text-white mb-4">3. Date & Time</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold dark:text-gray-300">Start Date *</label>
                  <input type="date" value={form.start_date} onChange={e => handleChange('start_date', e.target.value)} className={`mt-1 w-full glass-input px-4 py-2.5 text-sm ${errors.start_date ? 'ring-2 ring-red-400' : ''}`} />
                </div>
                <div>
                  <label className="text-xs font-semibold dark:text-gray-300">Start Time *</label>
                  <input type="time" value={form.start_time} onChange={e => handleChange('start_time', e.target.value)} className={`mt-1 w-full glass-input px-4 py-2.5 text-sm ${errors.start_time ? 'ring-2 ring-red-400' : ''}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold dark:text-gray-300">End Date</label><input type="date" value={form.end_date} onChange={e => handleChange('end_date', e.target.value)} className="mt-1 w-full glass-input px-4 py-2.5 text-sm" /></div>
                <div><label className="text-xs font-semibold dark:text-gray-300">End Time</label><input type="time" value={form.end_time} onChange={e => handleChange('end_time', e.target.value)} className="mt-1 w-full glass-input px-4 py-2.5 text-sm" /></div>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-sm dark:text-white mb-4">4. Location</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold dark:text-gray-300">Event Type</label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {['Online','Offline','Hybrid'].map(t => (
                    <button key={t} onClick={() => handleChange('event_type', t)} className={`py-2 text-xs font-medium rounded-lg transition-all ${form.event_type === t ? 'bg-purple-500 text-white shadow-md' : 'glass-input text-gray-600 dark:text-gray-400'}`}>{t}</button>
                  ))}
                </div>
              </div>
              {form.event_type !== 'Offline' && (
                <div><label className="text-xs font-semibold dark:text-gray-300">Online Event Link</label><input type="url" value={form.event_link} onChange={e => handleChange('event_link', e.target.value)} placeholder="https://zoom.us/..." className="mt-1 w-full glass-input px-4 py-2.5 text-sm" /></div>
              )}
              {form.event_type !== 'Online' && (
                <div><label className="text-xs font-semibold dark:text-gray-300">Venue</label><input type="text" value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="Enter venue address" className="mt-1 w-full glass-input px-4 py-2.5 text-sm" /></div>
              )}
            </div>
          </div>
        </div>

        {/* Tickets + Organizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-sm dark:text-white mb-4">5. Tickets & Registration</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold dark:text-gray-300">Ticket Type</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {['Free Event','Paid Event'].map(t => (
                    <button key={t} onClick={() => handleChange('ticket_type', t)} className={`py-2 text-xs font-medium rounded-lg ${form.ticket_type === t ? 'bg-purple-500 text-white shadow-md' : 'glass-input text-gray-600 dark:text-gray-400'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div><label className="text-xs font-semibold dark:text-gray-300">Max Attendees</label><input type="number" value={form.max_attendees} onChange={e => handleChange('max_attendees', e.target.value)} className="mt-1 w-full glass-input px-4 py-2.5 text-sm" /></div>
              <div><label className="text-xs font-semibold dark:text-gray-300">Registration Deadline</label><input type="date" value={form.registration_deadline} onChange={e => handleChange('registration_deadline', e.target.value)} className="mt-1 w-full glass-input px-4 py-2.5 text-sm" /></div>
              <div><label className="text-xs font-semibold dark:text-gray-300">External Registration Link</label><input type="url" value={form.registration_link} onChange={e => handleChange('registration_link', e.target.value)} placeholder="e.g., Google Form, Luma, Eventbrite (optional)" className="mt-1 w-full glass-input px-4 py-2.5 text-sm" /></div>
            </div>
          </div>
          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-sm dark:text-white mb-4">6. Hosting Organization</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold dark:text-gray-300">Organization Type</label>
                <select value={form.organization_type} onChange={e => handleChange('organization_type', e.target.value)} className="mt-1 w-full glass-input px-4 py-2.5 text-sm">
                  {['School', 'College', 'University', 'Community', 'Startup', 'Company', 'Independent Organizer', 'Other'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {form.organization_type !== 'Independent Organizer' && form.organization_type !== 'Other' && (
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold dark:text-gray-300">Organization Name</label>
                  <input 
                    type="text" 
                    value={form.organization_name} 
                    onChange={e => handleChange('organization_name', e.target.value)} 
                    placeholder={`Enter ${form.organization_type.toLowerCase()} name`} 
                    className="mt-1 w-full glass-input px-4 py-2.5 text-sm" 
                  />
                </div>
              )}
              {(form.organization_type === 'Independent Organizer' || form.organization_type === 'Other') && (
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold dark:text-gray-300">Organization Name</label>
                  <input 
                    type="text" 
                    value={form.organization_name} 
                    onChange={e => handleChange('organization_name', e.target.value)} 
                    placeholder="Enter organization name (optional)" 
                    className="mt-1 w-full glass-input px-4 py-2.5 text-sm" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organizer Verification */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-purple-500" />
              <h2 className="font-display font-bold text-sm dark:text-white">7. Organizer Verification</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Verify your identity before publishing. Contact details are only visible to you.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold dark:text-gray-300">Full Name *</label>
                <input type="text" value={form.organizer_name} onChange={e => handleChange('organizer_name', e.target.value)} placeholder="Your full name" className={`mt-1 w-full glass-input px-4 py-2.5 text-sm ${errors.organizer_name ? 'ring-2 ring-red-400' : ''}`} />
                {errors.organizer_name && <p className="text-xs text-red-400 mt-1">{errors.organizer_name}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold dark:text-gray-300">Contact Email *</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="email"
                    value={form.organizer_contact_email}
                    onChange={e => {
                      const val = e.target.value;
                      handleChange('organizer_contact_email', val);
                      setEmailVerified(false);
                      if (val.trim()) {
                        setEmailValidation(validateOrganizerEmail(val));
                      } else {
                        setEmailValidation({ valid: null, reason: '', trust: null });
                      }
                    }}
                    placeholder="organizer@company.com"
                    disabled={emailVerified}
                    className={`flex-1 glass-input px-4 py-2.5 text-sm transition-all ${
                      emailVerified ? 'opacity-60' : ''
                    } ${
                      errors.organizer_contact_email || emailValidation.valid === false ? 'ring-2 ring-red-400 shadow-red-500/20 shadow-lg' :
                      emailValidation.valid === true ? 'ring-2 ring-green-400/50 shadow-green-500/10 shadow-lg' : ''
                    }`}
                  />
                  <button
                    onClick={() => {
                      const check = validateOrganizerEmail(form.organizer_contact_email);
                      if (!check.valid) {
                        setErrors(prev => ({ ...prev, organizer_contact_email: check.reason }));
                        return;
                      }
                      setShowOtpModal(true);
                    }}
                    disabled={!form.organizer_contact_email.trim() || emailVerified || emailValidation.valid === false}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
                      emailVerified
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg disabled:opacity-50'
                    }`}
                  >
                    {emailVerified ? <><CheckCircle className="w-3.5 h-3.5" /> Verified</> : <><Shield className="w-3.5 h-3.5" /> Verify</>}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Can be different from your login email</p>
                {/* Real-time email validation feedback */}
                {emailValidation.valid === false && !errors.organizer_contact_email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {emailValidation.reason}
                  </motion.p>
                )}
                {emailValidation.valid === true && !emailVerified && emailValidation.trust === 'high' && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-green-400 mt-1.5 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                    Trusted email domain — proceed to verify
                  </motion.p>
                )}
                {emailValidation.valid === true && !emailVerified && emailValidation.trust === 'standard' && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-blue-400 mt-1.5 flex items-center gap-1.5"
                  >
                    <Shield className="w-3 h-3 flex-shrink-0" />
                    Organization email detected — proceed to verify
                  </motion.p>
                )}
                {errors.organizer_contact_email && <p className="text-xs text-red-400 mt-1">{errors.organizer_contact_email}</p>}
                {errors.email_verified && !emailVerified && <p className="text-xs text-red-400 mt-1">{errors.email_verified}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="glass-card p-6">
          <h2 className="font-display font-bold text-sm dark:text-white mb-4">8. About the Event</h2>
          <textarea rows={5} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Tell people more about your event..." className="w-full glass-input px-4 py-3 text-sm resize-none" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end pb-8">
          <button onClick={handleClear} className="px-6 py-2.5 text-sm font-medium glass-card hover:bg-white/40 dark:hover:bg-white/10 transition-all">Clear All</button>
          <button
            onClick={handlePublish}
            disabled={publishing || (dailyLimitInfo && dailyLimitInfo.remaining <= 0)}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {publishing ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</> : <><Send className="w-4 h-4" /> Publish Event</>}
          </button>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={form.organizer_contact_email}
        onVerified={() => setEmailVerified(true)}
      />
    </motion.div>
  );
}
