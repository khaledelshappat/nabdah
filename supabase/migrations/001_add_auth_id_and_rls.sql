-- =============================================================
-- Migration 001: Add auth_id to users + RLS Policies for Nabdah
-- Run this in Supabase SQL Editor
-- =============================================================

-- 1. Add auth_id column to users table (links to Supabase Auth)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_idx ON users(auth_id);

-- =============================================================
-- 2. Helper function: get clinic_id of the logged-in user
-- =============================================================
CREATE OR REPLACE FUNCTION get_my_clinic_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT clinic_id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- =============================================================
-- 3. RLS Policies
-- =============================================================

-- PATIENTS: only see patients in your clinic
DROP POLICY IF EXISTS "clinic_patients" ON patients;
CREATE POLICY "clinic_patients" ON patients
  FOR ALL USING (clinic_id = get_my_clinic_id())
  WITH CHECK (clinic_id = get_my_clinic_id());

-- APPOINTMENTS: only see appointments in your clinic
DROP POLICY IF EXISTS "clinic_appointments" ON appointments;
CREATE POLICY "clinic_appointments" ON appointments
  FOR ALL USING (clinic_id = get_my_clinic_id())
  WITH CHECK (clinic_id = get_my_clinic_id());

-- VISITS: only see visits in your clinic
DROP POLICY IF EXISTS "clinic_visits" ON visits;
CREATE POLICY "clinic_visits" ON visits
  FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE clinic_id = get_my_clinic_id())
  );

-- MEDICATIONS: only see medications of your clinic's patients
DROP POLICY IF EXISTS "clinic_medications" ON medications;
CREATE POLICY "clinic_medications" ON medications
  FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE clinic_id = get_my_clinic_id())
  );

-- LAB RESULTS: only see lab results of your clinic's patients
DROP POLICY IF EXISTS "clinic_lab_results" ON lab_results;
CREATE POLICY "clinic_lab_results" ON lab_results
  FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE clinic_id = get_my_clinic_id())
  );

-- USERS: each user can see their own clinic's staff
DROP POLICY IF EXISTS "clinic_users" ON users;
CREATE POLICY "clinic_users" ON users
  FOR SELECT USING (clinic_id = get_my_clinic_id());

-- =============================================================
-- 4. Enable RLS on all tables (if not already enabled)
-- =============================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- HOW TO CREATE A USER AFTER THIS MIGRATION:
-- 1. Create user in Supabase Auth (Authentication > Users > Add user)
-- 2. Copy the UUID from Auth
-- 3. Run: UPDATE users SET auth_id = 'PASTE-UUID-HERE' WHERE id = 'USER-TABLE-ID';
-- =============================================================
