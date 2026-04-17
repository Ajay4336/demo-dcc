-- Delivery Command Center — optional schema for persisting MVP data in Supabase.
-- Run in the SQL editor or via supabase db push after linking a project.

create extension if not exists "pgcrypto";

-- Seeded project metadata (optional; demo can stay static in app code)
create table if not exists public.projects (
  id text primary key,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Installed agents per workspace/tenant
create table if not exists public.agent_installs (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null default 'default',
  agent_id text not null,
  installed_at timestamptz default now(),
  unique (workspace_id, agent_id)
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null default 'default',
  agent_id text not null,
  project_id text references public.projects (id),
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  output_summary text
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null default 'default',
  ts timestamptz not null default now(),
  actor text not null,
  action text not null,
  detail text,
  resource text
);

create index if not exists audit_log_ts_idx on public.audit_log (ts desc);
create index if not exists agent_runs_started_idx on public.agent_runs (started_at desc);

-- Enable RLS in production and add policies for your workspace / auth model.
-- alter table public.projects enable row level security;
