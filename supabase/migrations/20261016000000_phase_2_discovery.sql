create type public.integration_status as enum ('disconnected', 'connected', 'expired', 'permission_denied', 'error');
create type public.job_user_state_kind as enum ('none', 'saved', 'bookmarked', 'hidden', 'tracking');

create table public.discovery_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('upwork_api', 'manual')),
  status public.integration_status not null default 'disconnected',
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  provider_account_id text,
  last_connected_at timestamptz,
  last_synced_at timestamptz,
  last_error_code text,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider)
);

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  query text,
  filters jsonb not null default '{}',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_user_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  state public.job_user_state_kind not null default 'none',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, job_id)
);

alter table public.jobs
  add column if not exists source_id uuid references public.discovery_sources(id) on delete set null,
  add column if not exists job_type text not null default 'unknown' check (job_type in ('hourly', 'fixed', 'unknown')),
  add column if not exists currency text not null default 'USD',
  add column if not exists experience_level text not null default 'unknown' check (experience_level in ('entry', 'intermediate', 'expert', 'unknown')),
  add column if not exists skills text[] not null default '{}',
  add column if not exists client_country text,
  add column if not exists client_payment_verification text not null default 'unknown' check (client_payment_verification in ('verified', 'unverified', 'unknown')),
  add column if not exists client_rating numeric(3,2),
  add column if not exists client_spend numeric(14,2),
  add column if not exists proposal_count text not null default 'unknown' check (proposal_count in ('less_than_5', '5_to_10', '10_to_15', '15_to_20', '20_to_50', '50_plus', 'unknown')),
  add column if not exists retrieved_at timestamptz not null default now(),
  add column if not exists missing_fields text[] not null default '{}',
  add column if not exists search_document tsvector generated always as (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(array_to_string(skills, ' '), ''))) stored;

create unique index if not exists jobs_user_source_external_unique on public.jobs(user_id, source, external_id) where external_id is not null;
create index if not exists jobs_discovery_feed_idx on public.jobs(user_id, published_at desc nulls last, retrieved_at desc);
create index if not exists jobs_search_idx on public.jobs using gin(search_document);
create index if not exists jobs_skills_idx on public.jobs using gin(skills);
create index if not exists job_user_states_feed_idx on public.job_user_states(user_id, state, updated_at desc);
create index if not exists saved_searches_user_idx on public.saved_searches(user_id, updated_at desc);
create index if not exists discovery_sources_user_idx on public.discovery_sources(user_id, provider);

create trigger discovery_sources_set_updated_at before update on public.discovery_sources for each row execute function public.set_updated_at();
create trigger saved_searches_set_updated_at before update on public.saved_searches for each row execute function public.set_updated_at();
create trigger job_user_states_set_updated_at before update on public.job_user_states for each row execute function public.set_updated_at();

alter table public.discovery_sources enable row level security;
alter table public.saved_searches enable row level security;
alter table public.job_user_states enable row level security;

create policy "sources_select_own" on public.discovery_sources for select using ((select auth.uid()) = user_id);
create policy "sources_insert_own" on public.discovery_sources for insert with check ((select auth.uid()) = user_id);
create policy "sources_update_own" on public.discovery_sources for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "sources_delete_own" on public.discovery_sources for delete using ((select auth.uid()) = user_id);

create policy "searches_select_own" on public.saved_searches for select using ((select auth.uid()) = user_id);
create policy "searches_insert_own" on public.saved_searches for insert with check ((select auth.uid()) = user_id);
create policy "searches_update_own" on public.saved_searches for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "searches_delete_own" on public.saved_searches for delete using ((select auth.uid()) = user_id);

create policy "job_states_select_own" on public.job_user_states for select using ((select auth.uid()) = user_id);
create policy "job_states_insert_own" on public.job_user_states for insert with check ((select auth.uid()) = user_id and exists (select 1 from public.jobs j where j.id = job_id and j.user_id = (select auth.uid())));
create policy "job_states_update_own" on public.job_user_states for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "job_states_delete_own" on public.job_user_states for delete using ((select auth.uid()) = user_id);

revoke all on public.discovery_sources, public.saved_searches, public.job_user_states from anon;
grant select on public.discovery_sources to authenticated;
grant select, insert, update, delete on public.saved_searches, public.job_user_states to authenticated;

-- Integration tokens are written only by trusted server code using the service role.
revoke insert, update, delete on public.discovery_sources from authenticated;
