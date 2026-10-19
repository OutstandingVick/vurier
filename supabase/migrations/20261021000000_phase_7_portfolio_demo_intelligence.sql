create table public.demo_strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  input_fingerprint text not null,
  decision text not null check (decision in ('build','reuse','skip')),
  demo_kind text not null check (demo_kind in ('prototype','technical_audit','research_report','writing_sample','content_strategy')),
  roi_score integer not null check (roi_score between 0 and 100),
  roi_confidence integer not null check (roi_confidence between 0 and 100),
  roi_factors jsonb not null,
  unavailable_factors text[] not null default '{}',
  client_problem text not null,
  rationale jsonb not null default '[]',
  risks jsonb not null default '[]',
  selected_evidence_ids uuid[] not null default '{}',
  reuse_candidate_id uuid references public.portfolio_items(id) on delete set null,
  brief jsonb not null,
  implementation_prompt text not null,
  strategy_model text not null,
  artifact_model text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  estimated_cost_usd numeric(12,6) not null default 0 check (estimated_cost_usd >= 0),
  status text not null default 'draft' check (status in ('draft','reviewed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, job_id, input_fingerprint)
);

create table public.demo_references (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  strategy_id uuid not null references public.demo_strategies(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  url text not null,
  relevance text not null check (char_length(relevance) between 1 and 1000),
  source text not null default 'user' check (source in ('user','authorized_research')),
  http_status integer,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(strategy_id, url)
);

create table public.demo_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  strategy_id uuid not null references public.demo_strategies(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  status text not null default 'draft' check (status in ('draft','in_progress','completed')),
  url text,
  file_path text,
  notes text,
  verified boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not verified or (status='completed' and (url is not null or file_path is not null)))
);

create table public.proposal_demo_assets (
  user_id uuid not null references auth.users(id) on delete cascade,
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  asset_id uuid not null references public.demo_assets(id) on delete cascade,
  attached_at timestamptz not null default now(),
  primary key (proposal_id, asset_id)
);

create index demo_strategies_user_job_idx on public.demo_strategies(user_id, job_id, created_at desc);
create index demo_assets_strategy_idx on public.demo_assets(strategy_id, status);
create index demo_references_strategy_idx on public.demo_references(strategy_id, created_at);

alter table public.demo_strategies enable row level security;
alter table public.demo_references enable row level security;
alter table public.demo_assets enable row level security;
alter table public.proposal_demo_assets enable row level security;

create or replace function public.validate_demo_strategy_evidence() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.reuse_candidate_id is not null and not exists (select 1 from public.portfolio_items p where p.id=new.reuse_candidate_id and p.user_id=new.user_id and p.verified=true) then
    raise exception 'Reuse candidate must be verified evidence owned by the user';
  end if;
  if exists (select 1 from unnest(new.selected_evidence_ids) evidence_id where not exists (select 1 from public.portfolio_items p where p.id=evidence_id and p.user_id=new.user_id and p.verified=true)) then
    raise exception 'Selected evidence must be verified evidence owned by the user';
  end if;
  return new;
end;
$$;
create trigger validate_demo_strategy_evidence_trigger before insert or update of user_id,selected_evidence_ids,reuse_candidate_id on public.demo_strategies for each row execute function public.validate_demo_strategy_evidence();

create policy "demo_strategies_own" on public.demo_strategies for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id and exists(select 1 from public.jobs j where j.id=job_id and j.user_id=(select auth.uid())));
create policy "demo_references_own" on public.demo_references for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id and exists(select 1 from public.demo_strategies s where s.id=strategy_id and s.user_id=(select auth.uid())));
create policy "demo_assets_own" on public.demo_assets for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id and exists(select 1 from public.demo_strategies s where s.id=strategy_id and s.user_id=(select auth.uid())));
create policy "proposal_demo_assets_own" on public.proposal_demo_assets for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id and exists(select 1 from public.proposals p join public.demo_assets a on a.id=asset_id join public.demo_strategies s on s.id=a.strategy_id where p.id=proposal_id and p.user_id=(select auth.uid()) and a.user_id=(select auth.uid()) and a.status='completed' and a.verified=true and s.job_id=p.job_id));

grant select,insert,update,delete on public.demo_strategies,public.demo_references,public.demo_assets,public.proposal_demo_assets to authenticated;
revoke all on public.demo_strategies,public.demo_references,public.demo_assets,public.proposal_demo_assets from anon;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('demos','demos',false,15728640,array['application/pdf','text/plain','application/zip','image/png','image/jpeg','application/vnd.openxmlformats-officedocument.wordprocessingml.document']) on conflict (id) do nothing;
create policy "demo_files_select_own" on storage.objects for select to authenticated using (bucket_id='demos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "demo_files_insert_own" on storage.objects for insert to authenticated with check (bucket_id='demos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "demo_files_delete_own" on storage.objects for delete to authenticated using (bucket_id='demos' and (storage.foldername(name))[1]=(select auth.uid())::text);
