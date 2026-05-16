import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Link as LinkIcon, Save, Loader2, CheckCircle, Calendar, Ticket, Heart, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, updateProfile, uploadAvatar, fetchUserStats, createNotification } from '../lib/database';

export default function Profile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: '',
  });
  const [stats, setStats] = useState({ eventsCreated: 0, ticketsBooked: 0, savedEvents: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (user) loadProfile(); }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    const [profileRes, statsRes] = await Promise.all([
      fetchProfile(user.id),
      fetchUserStats(user.id),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
    } else {
      // Profile doesn't exist yet — fill from auth metadata
      setProfile(prev => ({
        ...prev,
        full_name: user.user_metadata?.full_name || '',
        username: user.user_metadata?.username || user.email?.split('@')[0] || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      }));
    }
    setStats(statsRes);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(user.id, {
      full_name: profile.full_name,
      username: profile.username,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
    });
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await createNotification(user.id, 'profile', 'Profile Updated', 'Your profile was updated successfully.');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Support JPG, PNG, WEBP and check size if necessary (e.g., < 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const { url, error } = await uploadAvatar(user.id, file);
      if (error) throw error;

      setProfile(prev => ({ ...prev, avatar_url: url }));
    } catch (err) {
      console.error('Avatar error:', err);
    } finally {
      setUploading(false);
    }
  };

  const avatarDisplay = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=8b5cf6&color=fff&size=200`;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div className="space-y-6">
          {/* Avatar + Name */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <img src={avatarDisplay} alt={profile.full_name} className="w-20 h-20 rounded-2xl object-cover border-3 border-purple-200 dark:border-purple-700" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold dark:text-white">{profile.full_name || 'Set your name'}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username || 'username'}</p>
                <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-base dark:text-white flex items-center gap-2"><Edit3 className="w-4 h-4 text-purple-500" /> Edit Profile</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold dark:text-gray-300">Full Name</label>
                <input type="text" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} className="mt-1 w-full glass-input px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold dark:text-gray-300">Username</label>
                <input type="text" value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} className="mt-1 w-full glass-input px-4 py-2.5 text-sm" />
              </div>

              <div>
                <label className="text-xs font-semibold dark:text-gray-300">Location</label>
                <input type="text" value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} placeholder="New Delhi, India" className="mt-1 w-full glass-input px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold dark:text-gray-300">Website</label>
                <input type="url" value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://yoursite.com" className="mt-1 w-full glass-input px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold dark:text-gray-300">Email</label>
                <input type="email" value={user?.email || ''} disabled className="mt-1 w-full glass-input px-4 py-2.5 text-sm opacity-50 cursor-not-allowed" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold dark:text-gray-300">Bio</label>
                <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} className="mt-1 w-full glass-input px-4 py-3 text-sm resize-none" maxLength={200} />
                <p className="text-xs text-gray-400 text-right mt-1">{(profile.bio || '').length}/200</p>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : saved ? <><CheckCircle className="w-4 h-4" /> Saved!</>
                  : <><Save className="w-4 h-4" /> Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-5">
          <div className="glass-card p-5">
            <h3 className="font-display font-bold text-sm dark:text-white mb-4">Your Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Events Created', value: stats.eventsCreated, icon: Calendar, color: 'text-purple-500' },
                { label: 'Tickets Booked', value: stats.ticketsBooked, icon: Ticket, color: 'text-blue-500' },
                { label: 'Saved Events', value: stats.savedEvents, icon: Heart, color: 'text-pink-500' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 dark:bg-white/5">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                  </div>
                  <span className="text-lg font-bold dark:text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-display font-bold text-sm dark:text-white mb-2">Account</h3>
            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <p>Provider: {user?.app_metadata?.provider || 'email'}</p>
              <p>Joined: {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
