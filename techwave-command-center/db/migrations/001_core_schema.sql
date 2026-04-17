-- Techwave Command Center — core schema (Postgres / Supabase)
-- Apply via Supabase SQL editor or `supabase db push` after linking.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Org & users
-- ---------------------------------------------------------------------------

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  organization_id uuid references public.organizations (id) on delete cascade,
  display_name text,
  role text not null default 'editor' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Projects & delivery inputs
-- ---------------------------------------------------------------------------

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  jira_project_key text,
  github_repo_full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('lead', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

create table if not exists public.sprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  external_id text,
  name text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  committed_points numeric,
  completed_points numeric,
  scope_added_points numeric,
  status text,
  raw jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.jira_issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  sprint_id uuid references public.sprints (id) on delete set null,
  issue_key text not null,
  summary text,
  status text,
  issue_type text,
  priority text,
  assignee_id text,
  story_points numeric,
  blocked boolean not null default false,
  reopened_count int not null default 0,
  cycle_time_days numeric,
  backlog_age_days numeric,
  created_at_external timestamptz,
  updated_at_external timestamptz,
  raw jsonb,
  synced_at timestamptz not null default now()
);

create index if not exists jira_issues_project_idx on public.jira_issues (project_id);
create index if not exists jira_issues_blocked_idx on public.jira_issues (project_id) where blocked = true;

create table if not exists public.github_pull_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  number int not null,
  title text,
  state text,
  author_login text,
  created_at_external timestamptz,
  merged_at timestamptz,
  closed_at timestamptz,
  additions int,
  deletions int,
  changed_files int,
  review_cycles int,
  is_stale boolean not null default false,
  time_to_first_review_hours numeric,
  time_to_merge_hours numeric,
  raw jsonb,
  synced_at timestamptz not null default now(),
  unique (project_id, number)
);

create index if not exists gh_pr_project_idx on public.github_pull_requests (project_id);

create table if not exists public.test_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  external_id text,
  name text,
  status text,
  conclusion text,
  started_at timestamptz,
  completed_at timestamptz,
  raw jsonb,
  synced_at timestamptz not null default now()
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete cascade,
  external_id text,
  title text,
  severity text,
  status text,
  started_at timestamptz,
  resolved_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Intelligence
-- ---------------------------------------------------------------------------

create table if not exists public.risk_scores (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  computed_at timestamptz not null default now(),
  risk_total numeric not null check (risk_total >= 0 and risk_total <= 100),
  confidence numeric not null check (confidence >= 0 and confidence <= 100),
  breakdown jsonb not null default '{}',
  model_version text
);

create index if not exists risk_scores_project_time_idx on public.risk_scores (project_id, computed_at desc);

create table if not exists public.risk_factors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  risk_score_id uuid references public.risk_scores (id) on delete cascade,
  category text not null,
  severity text not null,
  label text not null,
  detail text,
  source text,
  signal_refs jsonb,
  created_at timestamptz not null default now()
);

create index if not exists risk_factors_project_idx on public.risk_factors (project_id);
create index if not exists risk_factors_category_idx on public.risk_factors (category);

create table if not exists public.executive_summaries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version int not null default 1,
  internal_body text,
  client_body text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists exec_summaries_project_idx on public.executive_summaries (project_id, version desc);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  severity text not null,
  title text not null,
  body text,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Agents
-- ---------------------------------------------------------------------------

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  kind text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_versions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  version text not null,
  manifest jsonb,
  released_at timestamptz not null default now(),
  unique (agent_id, version)
);

create table if not exists public.agent_installs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  agent_version_id uuid references public.agent_versions (id),
  installed_by uuid references public.profiles (id),
  installed_at timestamptz not null default now(),
  unique (organization_id, agent_id)
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  output_summary text,
  error text,
  requested_by uuid references public.profiles (id)
);

create index if not exists agent_runs_org_time_idx on public.agent_runs (organization_id, started_at desc);

create table if not exists public.agent_tool_calls (
  id uuid primary key default gen_random_uuid(),
  agent_run_id uuid not null references public.agent_runs (id) on delete cascade,
  tool_name text not null,
  input jsonb,
  output jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Governance
-- ---------------------------------------------------------------------------

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  ts timestamptz not null default now(),
  actor text not null,
  action text not null,
  detail text,
  resource text,
  metadata jsonb
);

create index if not exists audit_logs_org_ts_idx on public.audit_logs (organization_id, ts desc);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_run_id uuid references public.agent_runs (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by uuid references public.profiles (id),
  resolved_by uuid references public.profiles (id),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  notes text
);

create index if not exists approvals_org_status_idx on public.approvals (organization_id, status);

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  unique (organization_id, key)
);

-- RLS: enable and add policies per your auth model (service role bypasses RLS).
-- alter table public.projects enable row level security;
