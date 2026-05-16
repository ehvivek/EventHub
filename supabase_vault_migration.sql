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
