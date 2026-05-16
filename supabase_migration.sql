-- =============================================
-- EventHub Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  location TEXT DEFAULT 'India',
  website TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  category TEXT DEFAULT 'Other',
  tags TEXT[] DEFAULT '{}',
  event_type TEXT DEFAULT 'Online',
  ticket_type TEXT DEFAULT 'Free Event',
  banner_url TEXT DEFAULT '',
  location TEXT DEFAULT '',
  event_link TEXT DEFAULT '',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Asia/Kolkata (GMT +5:30)',
  max_attendees INTEGER DEFAULT 100,
  registration_deadline TIMESTAMPTZ,
  organizer_name TEXT DEFAULT '',
  organizer_email TEXT DEFAULT '',
  organizer_website TEXT DEFAULT '',
  organizer_contact_email TEXT DEFAULT '',
  organizer_phone TEXT DEFAULT '',
  phone_verified BOOLEAN DEFAULT false,
  registration_link TEXT DEFAULT '',
  organization_type TEXT DEFAULT '',
  organization_name TEXT DEFAULT '',
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SAVED EVENTS TABLE
CREATE TABLE IF NOT EXISTS saved_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- 4. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Events: anyone can read published, creators can CRUD own
CREATE POLICY "Published events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = creator_id);

-- Saved events: users manage own
CREATE POLICY "Users can view own saved events" ON saved_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save events" ON saved_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave events" ON saved_events FOR DELETE USING (auth.uid() = user_id);

-- Registrations: users manage own, creators can see registrations for their events
CREATE POLICY "Users can view own registrations" ON registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events" ON registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unregister" ON registrations FOR DELETE USING (auth.uid() = user_id);

-- Notifications: users manage own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('event-banners', 'event-banners', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Event banners are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'event-banners');
CREATE POLICY "Users can upload event banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'event-banners' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own event banners" ON storage.objects FOR UPDATE USING (bucket_id = 'event-banners' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own event banners" ON storage.objects FOR DELETE USING (bucket_id = 'event-banners' AND auth.role() = 'authenticated');
-- =============================================
-- CUSTOM VAULT FEATURE MIGRATION
-- Run this in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS custom_vault_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  
  -- Date & Time
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  registered_date TIMESTAMPTZ,
  
  -- Event Type
  event_type TEXT DEFAULT 'Online',
  event_link TEXT DEFAULT '',
  location TEXT DEFAULT '',
  
  -- Organizer Details (Optional)
  organizer_name TEXT DEFAULT '',
  organizer_contact TEXT DEFAULT '',
  organizer_social_link TEXT DEFAULT '',
  organizer_website TEXT DEFAULT '',
  
  -- Premium Features
  importance INTEGER DEFAULT 50 CHECK (importance >= 1 AND importance <= 100),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed')),
  color_label TEXT DEFAULT 'default',
  is_pinned BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (Strictly Private)
-- =============================================
ALTER TABLE custom_vault_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own vault events" 
ON custom_vault_events 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
