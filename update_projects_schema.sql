-- Add content fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS benefits TEXT;
