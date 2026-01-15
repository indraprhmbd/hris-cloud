-- Migration: Add Project Status and Candidate Metadata
-- Run this in Supabase SQL Editor

-- Add is_active to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add metadata fields to applicants table
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS key_skills TEXT;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS cv_valid BOOLEAN DEFAULT TRUE;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applicants_updated_at BEFORE UPDATE ON applicants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_applicants_updated_at ON applicants(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);
