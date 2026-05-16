-- =============================================
-- PART 2: RLS POLICIES (Run after Part 1)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "events_select" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "events_update" ON events FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "events_delete" ON events FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "saved_select" ON saved_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_insert" ON saved_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete" ON saved_events FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "reg_select" ON registrations FOR SELECT USING (true);
CREATE POLICY "reg_insert" ON registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reg_delete" ON registrations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "notif_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_delete" ON notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (true);
