-- Migration to add soft delete support using Epoch sentinel value (1970-01-01)
-- Run this in the Supabase SQL Editor

-- 1. Add deleted_at to organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT '1970-01-01 00:00:00+00' NOT NULL;

-- 2. Add deleted_at to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT '1970-01-01 00:00:00+00' NOT NULL;

-- 3. Add deleted_at to applicants
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT '1970-01-01 00:00:00+00' NOT NULL;

-- 3. Update Unique Constraint for Applicants (Deduplication + Soft Delete)
-- Drop old constraint if exists
ALTER TABLE applicants DROP CONSTRAINT IF EXISTS applicants_project_id_cv_hash_key;
ALTER TABLE applicants DROP CONSTRAINT IF EXISTS unique_project_cv_hash;

-- Add new constraint that includes deleted_at
ALTER TABLE applicants
ADD CONSTRAINT unique_candidate_cv_hash_deleted_at UNIQUE (project_id, cv_hash, deleted_at);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_applicants_deleted_at ON applicants(deleted_at);
