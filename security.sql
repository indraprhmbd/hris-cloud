-- Enable RLS
alter table organizations enable row level security;
alter table projects enable row level security;
alter table api_keys enable row level security;
alter table applicants enable row level security;

-- Add Owner Column to Organizations (if not exists)
alter table organizations add column if not exists owner_id uuid references auth.users(id);

-- POLICIES

-- Organizations: Only the owner can see/edit
create policy "Owners can view their orgs"
on organizations for select
using (auth.uid() = owner_id);

create policy "Users can create orgs"
on organizations for insert
with check (auth.uid() = owner_id);

-- Projects: If you own the Org, you can see the Project
-- Note: This requires a join, which RLS supports but simpler is often better.
-- Let's assume for MVP we propagate owner_id to projects too for simple RLS, 
-- OR we trust the "org_id" check if we can verify org ownership.
-- A robust way implies adding owner_id to projects or using a subquery.
-- Let's add owner_id to projects for performance and simplicity in RLS.

alter table projects add column if not exists owner_id uuid references auth.users(id);

create policy "Owners can view their projects"
on projects for select
using (auth.uid() = owner_id);

create policy "Owners can create projects"
on projects for insert
with check (auth.uid() = owner_id);

-- Allow Public Access to Projects for GET /projects/{id} internal flow? 
-- Actually, the Career Page logic fetches /projects/{id}. 
-- We need a specific policy for "Public Read" if we want that open.
-- OR we use the service role key in backend for public fetches. 
-- Since Career Page uses backend proxy, backend has Service Key -> Bypass RLS. 
-- So RLS applies mainly to Frontend User (Dashboard).

-- Applicants: Only owner can see
alter table applicants add column if not exists owner_id uuid references auth.users(id);

create policy "Owners can view applicants"
on applicants for select
using (auth.uid() = owner_id);

create policy "Owners can update applicants"
on applicants for update
using (auth.uid() = owner_id);

-- Public Submission (Insert) for Applicants
-- Applicants are inserted by Backend (Service Role) -> Bypasses RLS. 
-- So we are good.

-- API Keys: Only owner
alter table api_keys add column if not exists owner_id uuid references auth.users(id);

create policy "Owners can view keys"
on api_keys for select
using (auth.uid() = owner_id);

create policy "Owners can create keys"
on api_keys for insert
with check (auth.uid() = owner_id);
