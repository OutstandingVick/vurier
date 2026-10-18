create table public.monitoring_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Job monitoring',
  enabled boolean not null default false,
  interval text not null default 'hourly' check (interval in ('15m','30m','hourly','daily')),
  timezone text not null default 'UTC',
  categories text[] not null default '{}',
  saved_search_ids uuid[] not null default '{}',
  score_threshold integer not null default 80 check (score_threshold between 0 and 100),
  max_jobs_per_run integer not null default 10 check (max_jobs_per_run between 1 and 25),
  trigger_schedule_id text,
  last_run_at timestamptz,
  next_run_at timestamptz,
  paused_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  in_app_enabled boolean not null default true,
  telegram_enabled boolean not null default false,
  telegram_connected boolean not null default false,
  telegram_chat_id text,
  quiet_start time,
  quiet_end time,
  timezone text not null default 'UTC',
  daily_notification_limit integer not null default 10 check (daily_notification_limit between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.telegram_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  encrypted_bot_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.monitoring_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  schedule_id uuid not null references public.monitoring_schedules(id) on delete cascade,
  idempotency_key text not null unique,
  trigger_run_id text,
  status text not null check (status in ('queued','running','completed','partial','failed','skipped','interrupted')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  jobs_discovered integer not null default 0,
  opportunities_analyzed integer not null default 0,
  notifications_delivered integer not null default 0,
  failures integer not null default 0,
  cached_analyses integer not null default 0,
  estimated_cost_usd numeric(10,6) not null default 0,
  error_code text,
  error_message text,
  metadata jsonb not null default '{}'
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  monitoring_run_id uuid references public.monitoring_runs(id) on delete set null,
  job_id uuid references public.jobs(id) on delete cascade,
  analysis_id uuid references public.job_analyses(id) on delete cascade,
  channel text not null check (channel in ('in_app','telegram')),
  status text not null check (status in ('pending','delivered','failed','suppressed')),
  idempotency_key text not null unique,
  provider_message_id text,
  attempts integer not null default 0,
  last_error text,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.monitoring_errors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  monitoring_run_id uuid references public.monitoring_runs(id) on delete cascade,
  stage text not null,
  code text,
  message text not null,
  retryable boolean not null default false,
  attempt integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.notifications add column if not exists category text not null default 'application';
alter table public.notifications add column if not exists action_url text;
alter table public.notifications add column if not exists dismissed_at timestamptz;
alter table public.settings add column if not exists daily_ai_budget_usd numeric(10,2) not null default 2 check (daily_ai_budget_usd >= 0);

create index monitoring_runs_user_started_idx on public.monitoring_runs(user_id, started_at desc);
create index notification_deliveries_user_created_idx on public.notification_deliveries(user_id, created_at desc);
create index notifications_user_unread_idx on public.notifications(user_id, created_at desc) where read_at is null and dismissed_at is null;

alter table public.monitoring_schedules enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.monitoring_runs enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.monitoring_errors enable row level security;
alter table public.telegram_connections enable row level security;

create policy "monitoring_schedules_own" on public.monitoring_schedules for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "notification_preferences_own" on public.notification_preferences for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "monitoring_runs_read_own" on public.monitoring_runs for select using ((select auth.uid())=user_id);
create policy "notification_deliveries_read_own" on public.notification_deliveries for select using ((select auth.uid())=user_id);
create policy "monitoring_errors_read_own" on public.monitoring_errors for select using ((select auth.uid())=user_id);

grant select,insert,update,delete on public.monitoring_schedules, public.notification_preferences to authenticated;
grant select on public.monitoring_runs, public.notification_deliveries, public.monitoring_errors to authenticated;
revoke all on public.monitoring_schedules, public.notification_preferences, public.monitoring_runs, public.notification_deliveries, public.monitoring_errors from anon;
revoke all on public.telegram_connections from anon, authenticated;
