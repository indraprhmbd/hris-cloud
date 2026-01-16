-- Migration to add CV hashing for deduplication
-- Run this in the Supabase SQL Editor

-- 1. Add cv_hash column
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS cv_hash text;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_applicants_cv_hash ON applicants(cv_hash);

-- 3. Add unique constraint
-- Note: This might fail if you already have EXACT duplicate CVs for the same project.
-- If it fails, manually delete duplicate applicants before running this.
ALTER TABLE applicants
ADD CONSTRAINT unique_project_cv_hash UNIQUE (project_id, cv_hash);
