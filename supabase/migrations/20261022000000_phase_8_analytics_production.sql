alter table public.applications
  add column if not exists earnings numeric(14,2) check (earnings is null or earnings >= 0),
  add column if not exists earnings_confirmed boolean not null default false,
  add column if not exists time_invested_minutes integer check (time_invested_minutes is null or time_invested_minutes >= 0),
  add column if not exists time_confirmed boolean not null default false,
  add column if not exists outcome_note text;

alter table public.job_analyses
  add column if not exists base_score integer check (base_score is null or base_score between 0 and 100),
  add column if not exists optimization_adjustment numeric(4,1) not null default 0 check (optimization_adjustment between -10 and 10),
  add column if not exists adjustment_explanations jsonb not null default '[]';

alter table public.monitoring_runs
  add column if not exists lease_owner text,
  add column if not exists lease_expires_at timestamptz;

alter table public.settings
  add column if not exists connects_usd_rate numeric(8,4) not null default 0.15 check (connects_usd_rate >= 0),
  add column if not exists monthly_research_budget_usd numeric(10,2) not null default 0 check (monthly_research_budget_usd >= 0),
  add column if not exists feedback_optimization_enabled boolean not null default false,
  add column if not exists feedback_max_adjustment numeric(4,1) not null default 5 check (feedback_max_adjustment between 0 and 10);

create table public.external_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('research','infrastructure','other')),
  provider text,
  description text not null check (char_length(description) between 1 and 500),
  amount_usd numeric(12,4) not null check (amount_usd >= 0),
  estimated boolean not null default false,
  incurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.ranking_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  factor text not null,
  adjustment numeric(4,1) not null check (adjustment between -10 and 10),
  sample_size integer not null check (sample_size >= 3),
  explanation text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  rolled_back_at timestamptz
);

create table public.operational_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  level text not null check (level in ('info','warning','error')),
  event text not null,
  source text not null,
  request_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.integration_health (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  integration text not null check (integration in ('upwork','deepseek','telegram','trigger','supabase')),
  status text not null check (status in ('connected','disabled','error','unknown')),
  detail text not null,
  checked_at timestamptz not null default now(),
  unique(user_id,integration)
);

create table public.connects_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  application_version integer not null,
  amount integer not null check (amount >= 0),
  status text not null default 'reserved' check (status in ('reserved','consumed','released')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(application_id,application_version)
);

create table public.ai_cost_reservations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  amount_usd numeric(12,6) not null check (amount_usd > 0), purpose text not null,
  status text not null default 'reserved' check (status in ('reserved','released')),
  expires_at timestamptz not null, created_at timestamptz not null default now()
);
create table public.provider_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade, provider text not null,
  tokens numeric(8,3) not null, updated_at timestamptz not null default now(), primary key(user_id,provider)
);

create index if not exists jobs_user_created_category_idx on public.jobs(user_id,created_at desc,category);
create index if not exists analyses_user_created_score_idx on public.job_analyses(user_id,created_at desc,overall_score);
create index if not exists proposals_user_created_idx on public.proposals(user_id,created_at desc);
create index if not exists applications_user_created_status_idx on public.applications(user_id,created_at desc,status);
create index if not exists applications_user_submitted_idx on public.applications(user_id,submitted_at desc) where submitted_at is not null;
create index if not exists status_history_user_created_idx on public.application_status_history(user_id,created_at desc,to_status);
create index if not exists external_expenses_user_incurred_idx on public.external_expenses(user_id,incurred_at desc);
create index if not exists operational_events_user_created_idx on public.operational_events(user_id,created_at desc,level);
create index if not exists ranking_adjustments_user_active_idx on public.ranking_adjustments(user_id,created_at desc) where active=true;
create unique index if not exists connects_ledger_application_kind_unique on public.connects_ledger(application_id,kind) where application_id is not null and kind in ('application','boost');

alter table public.external_expenses enable row level security;
alter table public.ranking_adjustments enable row level security;
alter table public.operational_events enable row level security;
alter table public.integration_health enable row level security;
alter table public.connects_reservations enable row level security;
alter table public.ai_cost_reservations enable row level security;
alter table public.provider_rate_limits enable row level security;
create policy "external_expenses_own" on public.external_expenses for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "ranking_adjustments_read_own" on public.ranking_adjustments for select using ((select auth.uid())=user_id);
create policy "ranking_adjustments_update_own" on public.ranking_adjustments for update using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "operational_events_read_own" on public.operational_events for select using ((select auth.uid())=user_id);
create policy "integration_health_read_own" on public.integration_health for select using ((select auth.uid())=user_id);
create policy "connects_reservations_read_own" on public.connects_reservations for select using ((select auth.uid())=user_id);
create policy "ai_cost_reservations_read_own" on public.ai_cost_reservations for select using ((select auth.uid())=user_id);
grant select,insert,update,delete on public.external_expenses to authenticated;
grant select,update on public.ranking_adjustments to authenticated;
grant select on public.operational_events,public.integration_health,public.connects_reservations to authenticated;
grant select on public.ai_cost_reservations to authenticated;
revoke all on public.external_expenses,public.ranking_adjustments,public.operational_events,public.integration_health,public.connects_reservations from anon;
revoke all on public.ai_cost_reservations from anon;
revoke all on public.provider_rate_limits from anon,authenticated;

create or replace function public.consume_provider_rate_limit(p_user_id uuid,p_provider text,p_capacity numeric,p_refill_per_second numeric) returns void language plpgsql security definer set search_path=public as $$
declare v_row public.provider_rate_limits; v_tokens numeric; v_now timestamptz:=clock_timestamp();
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Service role required'; end if;
  insert into public.provider_rate_limits(user_id,provider,tokens,updated_at) values(p_user_id,p_provider,p_capacity-1,v_now) on conflict do nothing;
  if found then return; end if;
  select * into v_row from public.provider_rate_limits where user_id=p_user_id and provider=p_provider for update;
  v_tokens:=least(p_capacity,v_row.tokens+extract(epoch from (v_now-v_row.updated_at))*p_refill_per_second);
  if v_tokens<1 then raise exception 'Provider rate limit reached'; end if;
  update public.provider_rate_limits set tokens=v_tokens-1,updated_at=v_now where user_id=p_user_id and provider=p_provider;
end; $$;
grant execute on function public.consume_provider_rate_limit(uuid,text,numeric,numeric) to service_role;
revoke all on function public.consume_provider_rate_limit(uuid,text,numeric,numeric) from anon,authenticated;

create or replace function public.claim_monitoring_run(p_user_id uuid,p_schedule_id uuid,p_idempotency_key text,p_lease_owner text) returns table(run_id uuid,acquired boolean) language plpgsql security definer set search_path=public as $$
declare v_run public.monitoring_runs;
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Service role required'; end if;
  perform pg_advisory_xact_lock(hashtextextended('monitor:'||p_idempotency_key,0));
  select * into v_run from public.monitoring_runs where idempotency_key=p_idempotency_key for update;
  if not found then
    insert into public.monitoring_runs(user_id,schedule_id,idempotency_key,trigger_run_id,status,lease_owner,lease_expires_at) values(p_user_id,p_schedule_id,p_idempotency_key,p_lease_owner,'running',p_lease_owner,now()+interval '10 minutes') returning id into run_id;
    acquired:=true; return next; return;
  end if;
  run_id:=v_run.id;
  if v_run.user_id<>p_user_id or v_run.schedule_id<>p_schedule_id then raise exception 'Run identity mismatch'; end if;
  if v_run.status in ('completed','partial','skipped') or (v_run.status='running' and v_run.lease_expires_at>now()) then acquired:=false; return next; return; end if;
  update public.monitoring_runs set status='running',lease_owner=p_lease_owner,lease_expires_at=now()+interval '10 minutes',started_at=now(),completed_at=null,error_code=null,error_message=null where id=v_run.id;
  acquired:=true; return next;
end; $$;
grant execute on function public.claim_monitoring_run(uuid,uuid,text,text) to service_role;
revoke all on function public.claim_monitoring_run(uuid,uuid,text,text) from anon,authenticated;

create or replace function public.validate_owned_application_chain() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from public.proposals p where p.id=new.proposal_id and p.user_id=new.user_id and p.job_id=new.job_id) then raise exception 'Application proposal and job must share ownership'; end if;
  if new.proposal_version_id is not null and not exists(select 1 from public.proposal_versions v where v.id=new.proposal_version_id and v.proposal_id=new.proposal_id and v.user_id=new.user_id) then raise exception 'Application version must belong to its proposal'; end if;
  return new;
end; $$;
drop trigger if exists validate_owned_application_chain_trigger on public.applications;
create trigger validate_owned_application_chain_trigger before insert or update of user_id,job_id,proposal_id,proposal_version_id on public.applications for each row execute function public.validate_owned_application_chain();

create or replace function public.validate_owned_proposal_job() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from public.jobs j where j.id=new.job_id and j.user_id=new.user_id) then raise exception 'Proposal job must share ownership'; end if;
  return new;
end; $$;
drop trigger if exists validate_owned_proposal_job_trigger on public.proposals;
create trigger validate_owned_proposal_job_trigger before insert or update of user_id,job_id on public.proposals for each row execute function public.validate_owned_proposal_job();

revoke insert,update,delete on public.applications from authenticated;
revoke insert,update,delete on public.application_approvals,public.application_status_history,public.submission_attempts,public.connects_ledger,public.application_audit_logs,public.notifications from authenticated;
grant select on public.applications,public.application_approvals,public.application_status_history,public.submission_attempts,public.connects_ledger,public.application_audit_logs,public.notifications to authenticated;

create or replace view public.discovery_source_status with (security_invoker=true) as select id,user_id,provider,status,scopes,last_connected_at,last_error_code,last_error_message,created_at,updated_at from public.discovery_sources;
revoke select on public.discovery_sources from authenticated;
grant select on public.discovery_source_status to authenticated;

create or replace function public.reserve_ai_cost(p_user_id uuid,p_amount_usd numeric,p_purpose text) returns uuid language plpgsql security definer set search_path=public as $$
declare v_actor uuid := auth.uid(); v_limit numeric; v_spent numeric; v_reserved numeric; v_id uuid;
begin
  if v_actor is distinct from p_user_id and coalesce(auth.role(),'') <> 'service_role' then raise exception 'Not authorized'; end if;
  if p_amount_usd<=0 or p_amount_usd>5 then raise exception 'Invalid reservation amount'; end if;
  perform pg_advisory_xact_lock(hashtextextended('ai:'||p_user_id::text,0));
  select monthly_ai_budget_usd into v_limit from public.settings where user_id=p_user_id;
  select coalesce((select sum(estimated_cost_usd) from public.job_analyses where user_id=p_user_id and created_at>=date_trunc('month',now())),0)+coalesce((select sum(estimated_cost_usd) from public.proposal_strategies where user_id=p_user_id and created_at>=date_trunc('month',now())),0)+coalesce((select sum(estimated_cost_usd) from public.demo_strategies where user_id=p_user_id and created_at>=date_trunc('month',now())),0) into v_spent;
  select coalesce(sum(amount_usd),0) into v_reserved from public.ai_cost_reservations where user_id=p_user_id and status='reserved' and expires_at>now();
  if v_spent+v_reserved+p_amount_usd>coalesce(v_limit,10) then raise exception 'Monthly AI spending limit reached'; end if;
  insert into public.ai_cost_reservations(user_id,amount_usd,purpose,expires_at) values(p_user_id,p_amount_usd,left(p_purpose,100),now()+interval '10 minutes') returning id into v_id;
  return v_id;
end; $$;
create or replace function public.release_ai_cost(p_reservation_id uuid,p_user_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is distinct from p_user_id and coalesce(auth.role(),'') <> 'service_role' then raise exception 'Not authorized'; end if;
  update public.ai_cost_reservations set status='released' where id=p_reservation_id and user_id=p_user_id and status='reserved';
end; $$;
grant execute on function public.reserve_ai_cost(uuid,numeric,text),public.release_ai_cost(uuid,uuid) to authenticated,service_role;
revoke all on function public.reserve_ai_cost(uuid,numeric,text),public.release_ai_cost(uuid,uuid) from anon;

create or replace function public.reserve_application_connects(p_application_id uuid) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_user uuid := auth.uid(); v_app public.applications; v_settings public.settings; v_daily integer; v_monthly integer; v_amount integer; v_id uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
  select * into v_app from public.applications where id=p_application_id and user_id=v_user for update;
  if not found or v_app.status <> 'approved' then raise exception 'Application is not approved'; end if;
  if not exists(select 1 from public.application_approvals a where a.application_id=v_app.id and a.user_id=v_user and a.application_version=v_app.application_version and a.fingerprint=v_app.package_fingerprint and a.invalidated_at is null and a.expires_at>now()) then raise exception 'Current approval is missing or expired'; end if;
  select * into v_settings from public.settings where user_id=v_user;
  v_amount := coalesce(v_app.connects_cost,0)+coalesce(v_app.boost_connects,0);
  select coalesce(sum(amount),0) into v_daily from public.connects_ledger where user_id=v_user and created_at>=date_trunc('day',now());
  v_daily := v_daily + coalesce((select sum(amount) from public.connects_reservations where user_id=v_user and status='reserved' and expires_at>now()),0);
  select coalesce(sum(amount),0) into v_monthly from public.connects_ledger where user_id=v_user and created_at>=date_trunc('month',now());
  v_monthly := v_monthly + coalesce((select sum(amount) from public.connects_reservations where user_id=v_user and status='reserved' and expires_at>now()),0);
  if v_daily+v_amount>coalesce(v_settings.daily_connects_limit,40) or v_monthly+v_amount>coalesce(v_settings.monthly_connects_limit,200) then raise exception 'Connects spending limit exceeded'; end if;
  insert into public.connects_reservations(user_id,application_id,application_version,amount,expires_at) values(v_user,v_app.id,v_app.application_version,v_amount,now()+interval '20 minutes') returning id into v_id;
  return v_id;
end; $$;

create or replace function public.finalize_connects_reservation(p_reservation_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare v_user uuid := auth.uid(); v_res public.connects_reservations; v_app public.applications;
begin
  select * into v_res from public.connects_reservations where id=p_reservation_id and user_id=v_user and status='reserved' for update;
  if not found then raise exception 'Active reservation not found'; end if;
  select * into v_app from public.applications where id=v_res.application_id and user_id=v_user;
  insert into public.connects_ledger(user_id,application_id,kind,amount,source) values(v_user,v_app.id,'application',coalesce(v_app.connects_cost,0),'confirmed_submission') on conflict do nothing;
  insert into public.connects_ledger(user_id,application_id,kind,amount,source) values(v_user,v_app.id,'boost',coalesce(v_app.boost_connects,0),'confirmed_submission') on conflict do nothing;
  update public.connects_reservations set status='consumed' where id=v_res.id;
end; $$;

create or replace function public.release_connects_reservation(p_reservation_id uuid) returns void
language sql security definer set search_path=public as $$ update public.connects_reservations set status='released' where id=p_reservation_id and user_id=auth.uid() and status='reserved'; $$;
grant execute on function public.reserve_application_connects(uuid),public.finalize_connects_reservation(uuid),public.release_connects_reservation(uuid) to authenticated;
revoke all on function public.reserve_application_connects(uuid),public.finalize_connects_reservation(uuid),public.release_connects_reservation(uuid) from anon;
