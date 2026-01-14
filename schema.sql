-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations Table
create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Templates Table
create table templates (
  id text primary key, -- e.g., 'recruitment-ai-v1'
  name text not null,
  config jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed Template
insert into templates (id, name, config) values
('recruitment-ai-v1', 'AI Recruitment System', '{"features": ["public_page", "ai_scoring", "blind_mode"]}');

-- Projects Table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references organizations(id) not null,
  name text not null,
  template_id text references templates(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- API Keys Table
create table api_keys (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) not null,
  key_value text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Applicants Table
create table applicants (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) not null,
  name text not null,
  email text not null,
  cv_text text, -- Simple text storage for MVP
  ai_score integer,
  ai_reasoning text,
  status text default 'pending', -- pending, approved, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
