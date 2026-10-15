create extension if not exists pgcrypto;

create type public.job_status as enum ('discovered', 'shortlisted', 'dismissed', 'expired');
create type public.proposal_status as enum ('draft', 'ready_for_review', 'approved', 'submitted', 'archived');
create type public.application_status as enum ('submitted', 'viewed', 'interviewing', 'offered', 'won', 'lost', 'withdrawn');
create type public.agent_run_status as enum ('queued', 'running', 'completed', 'failed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  headline text,
  bio text,
  location text,
  timezone text not null default 'UTC',
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  project_url text,
  repository_url text,
  skills text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'upwork',
  external_id text,
  source_url text,
  title text not null,
  description text not null,
  category text,
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  hourly_min numeric(12,2),
  hourly_max numeric(12,2),
  connects_cost integer check (connects_cost is null or connects_cost >= 0),
  status public.job_status not null default 'discovered',
  published_at timestamptz,
  source_payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, source, external_id)
);

create table public.job_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  model text not null,
  overall_score smallint check (overall_score between 0 and 100),
  fit_score smallint check (fit_score between 0 and 100),
  value_score smallint check (value_score between 0 and 100),
  confidence_score smallint check (confidence_score between 0 and 100),
  rationale jsonb not null default '[]',
  strengths jsonb not null default '[]',
  risks jsonb not null default '[]',
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status public.proposal_status not null default 'draft',
  cover_letter text not null default '',
  bid_amount numeric(12,2),
  connects_required integer check (connects_required is null or connects_required >= 0),
  model text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  proposal_id uuid not null unique references public.proposals(id) on delete restrict,
  external_id text,
  status public.application_status not null default 'submitted',
  connects_spent integer not null check (connects_spent >= 0),
  submitted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_type text not null,
  status public.agent_run_status not null default 'queued',
  model text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  metadata jsonb not null default '{}',
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_categories text[] not null default array['Frontend Development', 'Web3 & Fintech', 'Technical Writing'],
  minimum_fixed_budget numeric(12,2),
  minimum_hourly_rate numeric(12,2),
  maximum_connects_per_job integer check (maximum_connects_per_job is null or maximum_connects_per_job >= 0),
  preferred_model text not null default 'deepseek-flash' check (preferred_model in ('deepseek-flash', 'deepseek-v4-pro')),
  reasoning_effort text not null default 'medium' check (reasoning_effort in ('low', 'medium', 'high')),
  require_submission_approval boolean not null default true check (require_submission_approval = true),
  require_connects_approval boolean not null default true check (require_connects_approval = true),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_user_status_idx on public.jobs(user_id, status, created_at desc);
create index job_analyses_user_job_idx on public.job_analyses(user_id, job_id, created_at desc);
create index proposals_user_status_idx on public.proposals(user_id, status, updated_at desc);
create index applications_user_status_idx on public.applications(user_id, status, updated_at desc);
create index agent_runs_user_created_idx on public.agent_runs(user_id, created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger portfolio_items_set_updated_at before update on public.portfolio_items for each row execute function public.set_updated_at();
create trigger jobs_set_updated_at before update on public.jobs for each row execute function public.set_updated_at();
create trigger proposals_set_updated_at before update on public.proposals for each row execute function public.set_updated_at();
create trigger applications_set_updated_at before update on public.applications for each row execute function public.set_updated_at();
create trigger settings_set_updated_at before update on public.settings for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  insert into public.settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.jobs enable row level security;
alter table public.job_analyses enable row level security;
alter table public.proposals enable row level security;
alter table public.applications enable row level security;
alter table public.agent_runs enable row level security;
alter table public.settings enable row level security;

create policy "profiles_select_own" on public.profiles for select using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "portfolio_select_own" on public.portfolio_items for select using ((select auth.uid()) = user_id);
create policy "portfolio_insert_own" on public.portfolio_items for insert with check ((select auth.uid()) = user_id);
create policy "portfolio_update_own" on public.portfolio_items for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "portfolio_delete_own" on public.portfolio_items for delete using ((select auth.uid()) = user_id);

create policy "jobs_select_own" on public.jobs for select using ((select auth.uid()) = user_id);
create policy "jobs_insert_own" on public.jobs for insert with check ((select auth.uid()) = user_id);
create policy "jobs_update_own" on public.jobs for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "jobs_delete_own" on public.jobs for delete using ((select auth.uid()) = user_id);

create policy "analyses_select_own" on public.job_analyses for select using ((select auth.uid()) = user_id);
create policy "analyses_insert_own" on public.job_analyses for insert with check ((select auth.uid()) = user_id);
create policy "analyses_update_own" on public.job_analyses for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "analyses_delete_own" on public.job_analyses for delete using ((select auth.uid()) = user_id);

create policy "proposals_select_own" on public.proposals for select using ((select auth.uid()) = user_id);
create policy "proposals_insert_own" on public.proposals for insert with check ((select auth.uid()) = user_id);
create policy "proposals_update_own" on public.proposals for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "proposals_delete_own" on public.proposals for delete using ((select auth.uid()) = user_id);

create policy "applications_select_own" on public.applications for select using ((select auth.uid()) = user_id);
create policy "applications_insert_own" on public.applications for insert with check ((select auth.uid()) = user_id and exists (select 1 from public.proposals p where p.id = proposal_id and p.user_id = (select auth.uid()) and p.approved_at is not null));
create policy "applications_update_own" on public.applications for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "runs_select_own" on public.agent_runs for select using ((select auth.uid()) = user_id);
create policy "runs_insert_own" on public.agent_runs for insert with check ((select auth.uid()) = user_id);
create policy "runs_update_own" on public.agent_runs for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "settings_select_own" on public.settings for select using ((select auth.uid()) = user_id);
create policy "settings_update_own" on public.settings for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and require_submission_approval = true and require_connects_approval = true);

revoke all on public.profiles, public.portfolio_items, public.jobs, public.job_analyses, public.proposals, public.applications, public.agent_runs, public.settings from anon;
grant select, update on public.profiles, public.settings to authenticated;
grant select, insert, update, delete on public.portfolio_items, public.jobs, public.job_analyses, public.proposals to authenticated;
grant select, insert, update on public.applications, public.agent_runs to authenticated;
