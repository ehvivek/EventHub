-- =============================================
-- PART 1: TABLES (Run this first)
-- =============================================

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

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  category TEXT DEFAULT 'Other',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  event_type TEXT DEFAULT 'Online',
  ticket_type TEXT DEFAULT 'Free Event',
  banner_url TEXT DEFAULT '',
  location TEXT DEFAULT '',
  event_link TEXT DEFAULT '',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Asia/Kolkata',
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

CREATE TABLE IF NOT EXISTS saved_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

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
