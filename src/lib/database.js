import { supabase } from './supabase';
import { validateOrganizerEmail } from './emailValidator';

// =============================================
// PROFILES
// =============================================

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();
  // Also sync name/avatar to auth metadata
  const metaUpdates = {};
  if (updates.full_name) metaUpdates.full_name = updates.full_name;
  if (updates.avatar_url) metaUpdates.avatar_url = updates.avatar_url;
  if (Object.keys(metaUpdates).length > 0) {
    await supabase.auth.updateUser({ data: metaUpdates });
  }
  return { data, error };
}

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  if (uploadErr) {
    console.error('Avatar upload error:', uploadErr);
    return { url: null, error: uploadErr };
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = data.publicUrl + '?t=' + Date.now();
  await updateProfile(userId, { avatar_url: avatarUrl });
  return { url: avatarUrl, error: null };
}

// =============================================
// EVENTS
// =============================================

export async function fetchEvents({ category, search, sort, limit } = {}) {
  let query = supabase
    .from('events')
    .select('*')
    .eq('status', 'published');

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%,organizer_name.ilike.%${search}%`);
  }
  if (sort === 'popular') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('start_date', { ascending: true });
  }
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function fetchEventById(eventId) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();
  if (error) console.error('fetchEventById error:', error);

  // Fetch creator profile separately
  if (data?.creator_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, username')
      .eq('id', data.creator_id)
      .single();
    data.profiles = profile || null;
  }

  return { data, error };
}

export async function fetchMyEvents(userId) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

// =============================================
// RATE LIMITING & ANTI-SPAM
// =============================================

const DAILY_EVENT_LIMIT = 4;

export async function getEventCountToday(userId) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', userId)
    .gte('created_at', todayStart.toISOString());
  return { count: count || 0, limit: DAILY_EVENT_LIMIT, remaining: DAILY_EVENT_LIMIT - (count || 0), error };
}

export async function checkDuplicateEvent(userId, title) {
  const normalizedTitle = title.trim().toLowerCase();
  const { data, error } = await supabase
    .from('events')
    .select('id, title')
    .eq('creator_id', userId)
    .eq('status', 'published');
  if (error) return { isDuplicate: false, error };
  const duplicate = (data || []).find(e => e.title.trim().toLowerCase() === normalizedTitle);
  return { isDuplicate: !!duplicate, existingId: duplicate?.id, error: null };
}

const SUSPICIOUS_URL_PATTERNS = [
  /bit\.ly/i, /tinyurl/i, /t\.co/i, /goo\.gl/i,
  /\.(exe|bat|cmd|msi|dll|scr)$/i,
];

export function sanitizeEventInput(data) {
  const issues = [];
  // Check title
  if (data.title && data.title.trim().length < 3) issues.push('Title must be at least 3 characters');
  if (data.title && data.title.length > 200) issues.push('Title is too long (max 200 characters)');
  // Check description for suspicious links
  const textToCheck = `${data.description || ''} ${data.event_link || ''} ${data.location || ''}`;
  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(textToCheck)) {
      issues.push('Suspicious or shortened URLs detected. Please use full URLs.');
      break;
    }
  }
  // Check organizer email format
  if (data.organizer_contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.organizer_contact_email)) {
    issues.push('Invalid organizer contact email format');
  }

  return { valid: issues.length === 0, issues };
}

export async function createEvent(eventData) {
  // Backend email validation — cannot be bypassed via direct API call
  if (eventData.organizer_contact_email) {
    const emailCheck = validateOrganizerEmail(eventData.organizer_contact_email);
    if (!emailCheck.valid) {
      return { data: null, error: { message: emailCheck.reason } };
    }
  }

  const { data, error } = await supabase
    .from('events')
    .insert({ ...eventData, status: 'published' })
    .select()
    .single();
  return { data, error };
}

export async function updateEvent(eventId, updates) {
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .select()
    .single();
  return { data, error };
}

export async function deleteEvent(eventId) {
  // First, fetch the event to get the banner URL for cleanup
  const { data: eventData } = await supabase.from('events').select('banner_url').eq('id', eventId).single();

  // Delete the event from the database (cascades to registrations, saved_events, notifications)
  const { error } = await supabase.from('events').delete().eq('id', eventId);

  // If deleted successfully and a banner exists in our storage, remove it
  if (!error && eventData?.banner_url && eventData.banner_url.includes('event-banners')) {
    try {
      // Extract the file path from the public URL
      const urlParts = eventData.banner_url.split('/event-banners/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1].split('?')[0]; // remove any query params
        await supabase.storage.from('event-banners').remove([filePath]);
      }
    } catch (storageErr) {
      console.warn('Could not remove banner from storage:', storageErr);
      // Non-critical — event is already deleted from DB
    }
  }

  return { error };
}

export async function uploadEventBanner(userId, file) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}_banner.${ext}`;
  const { error } = await supabase.storage
    .from('event-banners')
    .upload(path, file, { upsert: true });
  if (error) {
    console.error('Banner upload error:', error);
    return { url: null, error };
  }
  const { data } = supabase.storage.from('event-banners').getPublicUrl(path);
  return { url: data.publicUrl + '?t=' + Date.now(), error: null };
}

// =============================================
// =============================================

export async function fetchSavedEvents(userId) {
  const { data, error } = await supabase
    .from('saved_events')
    .select('*, events(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function saveEvent(userId, eventId) {
  const { error } = await supabase
    .from('saved_events')
    .insert({ user_id: userId, event_id: eventId });
  return { error };
}

export async function unsaveEvent(userId, eventId) {
  const { error } = await supabase
    .from('saved_events')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);
  return { error };
}

export async function isEventSaved(userId, eventId) {
  const { data } = await supabase
    .from('saved_events')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();
  return !!data;
}

// =============================================
// REGISTRATIONS (TICKETS)
// =============================================

export async function fetchRegistrations(userId) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, events(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function registerForEvent(userId, eventId) {
  const { error } = await supabase
    .from('registrations')
    .insert({ user_id: userId, event_id: eventId });
  return { error };
}

export async function unregisterFromEvent(userId, eventId) {
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);
  return { error };
}

export async function isRegistered(userId, eventId) {
  const { data } = await supabase
    .from('registrations')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();
  return !!data;
}

export async function getRegistrationCount(eventId) {
  const { count } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);
  return count || 0;
}

// Fetch all registrations for an event (organizer view)
export async function fetchEventRegistrations(eventId) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error || !data) return { data: [], error };

  // Fetch profiles for each registrant
  const enriched = await Promise.all(
    data.map(async (reg) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, username')
        .eq('id', reg.user_id)
        .single();

      // Fetch email from auth metadata via user_id
      const { data: authUser } = await supabase.auth.admin?.getUserById?.(reg.user_id) || {};

      return {
        ...reg,
        profile: profile || { full_name: 'Unknown User', avatar_url: null, username: null },
        email: authUser?.user?.email || null,
      };
    })
  );

  return { data: enriched, error: null };
}

// Simple version without admin API (uses profiles table only)
export async function fetchEventRegistrationsSimple(eventId) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error || !data) return { data: [], error };

  const enriched = await Promise.all(
    data.map(async (reg) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, username')
        .eq('id', reg.user_id)
        .single();
      return {
        ...reg,
        profile: profile || { full_name: 'Unknown User', avatar_url: null, username: null },
      };
    })
  );

  return { data: enriched, error: null };
}

// Remove a specific registration (organizer action)
export async function removeRegistration(registrationId) {
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', registrationId);
  return { error };
}

// =============================================
// NOTIFICATIONS
// =============================================

export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return { data: data || [], error };
}

export async function getUnreadCount(userId) {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return count || 0;
}

export async function markNotificationRead(notifId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notifId);
  return { error };
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return { error };
}

export async function clearNotifications(userId) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);
  return { error };
}

export async function createNotification(userId, type, title, message, eventId = null) {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, title, message, event_id: eventId });
  return { error };
}

// =============================================
// EVENT REMINDER NOTIFICATIONS
// =============================================
// Checks upcoming registered + vault events and auto-creates reminder notifications
// 1 day before and 1 hour before each event. Deduplicates by checking existing notifs.

export async function checkAndSendReminders(userId) {
  const now = new Date();

  // Fetch registered public events with event data
  const { data: registrations } = await supabase
    .from('registrations')
    .select('event_id, events(id, title, start_date)')
    .eq('user_id', userId);

  // Fetch vault (personal) events
  const { data: vaultEvents } = await supabase
    .from('custom_vault_events')
    .select('id, title, start_date')
    .eq('user_id', userId);

  // Fetch existing reminder notifications to avoid duplicates
  const { data: existingNotifs } = await supabase
    .from('notifications')
    .select('title, event_id')
    .eq('user_id', userId)
    .in('type', ['reminder_24h', 'reminder_1h']);

  const alreadySent = new Set(
    (existingNotifs || []).map((n) => `${n.type || ''}_${n.event_id || n.title}`)
  );

  // Helper: check if a reminder should fire
  const shouldFire = (startDateStr, windowStart, windowEnd) => {
    if (!startDateStr) return false;
    const eventTime = new Date(startDateStr).getTime();
    const msUntil = eventTime - now.getTime();
    return msUntil >= windowStart && msUntil <= windowEnd;
  };

  const promises = [];
  const fired = []; // track newly sent reminders for OS push

  // Process public registered events
  for (const reg of registrations || []) {
    const event = reg.events;
    if (!event) continue;

    const key24 = `reminder_24h_${event.id}`;
    const key1h  = `reminder_1h_${event.id}`;

    // 24h window: between 23 and 25 hours from now
    if (!alreadySent.has(key24) && shouldFire(event.start_date, 23 * 3600 * 1000, 25 * 3600 * 1000)) {
      const title = '📅 Event Tomorrow!';
      const message = `"${event.title}" starts in approximately 24 hours. Get ready!`;
      promises.push(supabase.from('notifications').insert({ user_id: userId, type: 'reminder_24h', title, message, event_id: event.id }));
      fired.push({ title, message, tag: `24h_${event.id}` });
    }

    // 1h window: between 50 and 70 minutes from now
    if (!alreadySent.has(key1h) && shouldFire(event.start_date, 50 * 60 * 1000, 70 * 60 * 1000)) {
      const title = '⏰ Starting Soon!';
      const message = `"${event.title}" starts in about 1 hour. Don't be late!`;
      promises.push(supabase.from('notifications').insert({ user_id: userId, type: 'reminder_1h', title, message, event_id: event.id }));
      fired.push({ title, message, tag: `1h_${event.id}` });
    }
  }

  // Process vault events
  for (const vault of vaultEvents || []) {
    const key24 = `reminder_24h_vault_${vault.id}`;
    const key1h  = `reminder_1h_vault_${vault.id}`;

    if (!alreadySent.has(key24) && shouldFire(vault.start_date, 23 * 3600 * 1000, 25 * 3600 * 1000)) {
      const title = '📅 Vault Event Tomorrow!';
      const message = `Your vault event "${vault.title}" starts in approximately 24 hours.`;
      promises.push(supabase.from('notifications').insert({ user_id: userId, type: 'reminder_24h', title, message, event_id: null }));
      fired.push({ title, message, tag: `24h_vault_${vault.id}` });
    }

    if (!alreadySent.has(key1h) && shouldFire(vault.start_date, 50 * 60 * 1000, 70 * 60 * 1000)) {
      const title = '⏰ Vault Event Starting Soon!';
      const message = `Your vault event "${vault.title}" starts in about 1 hour.`;
      promises.push(supabase.from('notifications').insert({ user_id: userId, type: 'reminder_1h', title, message, event_id: null }));
      fired.push({ title, message, tag: `1h_vault_${vault.id}` });
    }
  }

  await Promise.all(promises);

  return fired; // caller uses these to show OS push notifications
}

// =============================================
// STATS
// =============================================

export async function fetchUserStats(userId) {
  const [events, registrations, saved] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('creator_id', userId),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('saved_events').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ]);
  return {
    eventsCreated: events.count || 0,
    ticketsBooked: registrations.count || 0,
    savedEvents: saved.count || 0,
  };
}

// =============================================
// CUSTOM VAULT
// =============================================

export async function fetchVaultEvents(userId) {
  const { data, error } = await supabase
    .from('custom_vault_events')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true });
  return { data: data || [], error };
}

export async function createVaultEvent(eventData) {
  const { data, error } = await supabase
    .from('custom_vault_events')
    .insert(eventData)
    .select()
    .single();
  return { data, error };
}

export async function updateVaultEvent(eventId, updates) {
  const { data, error } = await supabase
    .from('custom_vault_events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .select()
    .single();
  return { data, error };
}

export async function deleteVaultEvent(eventId) {
  const { error } = await supabase
    .from('custom_vault_events')
    .delete()
    .eq('id', eventId);
  return { error };
}
