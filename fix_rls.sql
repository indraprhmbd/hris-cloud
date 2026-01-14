-- CRITICAL: Run this in Supabase SQL Editor RIGHT NOW

-- Add owner_id columns (these are REQUIRED for the backend to work)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);

-- If you already enabled RLS, you can either:
-- OPTION 1: Disable RLS temporarily (for MVP testing)
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE applicants DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Or keep RLS enabled and create proper policies
-- (Only do this if you want full security NOW)
-- See security.sql for full policy definitions
