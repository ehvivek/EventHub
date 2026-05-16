-- =============================================
-- ADMIN MODERATION SYSTEM MIGRATION
-- Run this ENTIRE script in Supabase SQL Editor
-- It does everything in one go — no manual steps needed
-- =============================================

-- Step 1: Add is_admin column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Step 2: Update the events deletion RLS policy
DROP POLICY IF EXISTS "events_delete" ON events;

CREATE POLICY "events_delete" ON events 
FOR DELETE 
USING (
  auth.uid() = creator_id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Step 3: Set YOUR account as admin (your-admin-email@example.com)
-- This finds your user ID automatically from your email and sets is_admin = true
UPDATE profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'
);

-- Verify it worked (you should see is_admin = true for your account)
SELECT id, full_name, is_admin 
FROM profiles 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'
);
