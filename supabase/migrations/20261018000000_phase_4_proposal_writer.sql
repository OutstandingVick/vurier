alter table public.portfolio_items
  add column if not exists kind text not null default 'project' check (kind in ('project','writing_sample','achievement','experience','resume','link')),
  add column if not exists achievements text[] not null default '{}',
  add column if not exists file_path text,
  add column if not exists verified boolean not null default false,
  add column if not exists category text;
create index if not exists portfolio_search_idx on public.portfolio_items using gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(array_to_string(skills,' '),'')));

create table public.proposal_strategies (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade, strategy jsonb not null,
  selected_evidence_ids uuid[] not null default '{}', model text not null, input_tokens integer not null default 0,
  estimated_cost_usd numeric(12,6) not null default 0, created_at timestamptz not null default now()
);
alter table public.proposals
  add column if not exists strategy_id uuid references public.proposal_strategies(id) on delete set null,
  add column if not exists qa_result jsonb not null default '{}', add column if not exists suggested_bid jsonb,
  add column if not exists estimated_timeline jsonb, add column if not exists milestones jsonb not null default '[]',
  add column if not exists screening_answers jsonb not null default '[]', add column if not exists attachment_ids uuid[] not null default '{}';
create table public.proposal_versions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  proposal_id uuid not null references public.proposals(id) on delete cascade, version_number integer not null check (version_number > 0),
  cover_letter text not null, draft_content jsonb not null default '{}', source text not null check (source in ('generated','rewrite','manual')),
  tone text, length text, qa_result jsonb not null default '{}', created_at timestamptz not null default now(), unique(proposal_id, version_number)
);
create index proposal_strategies_user_job_idx on public.proposal_strategies(user_id, job_id, created_at desc);
create index proposal_versions_user_proposal_idx on public.proposal_versions(user_id, proposal_id, version_number desc);
alter table public.proposal_strategies enable row level security; alter table public.proposal_versions enable row level security;
create policy "strategies_all_own" on public.proposal_strategies for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and exists (select 1 from public.jobs j where j.id = job_id and j.user_id = (select auth.uid())));
create policy "versions_all_own" on public.proposal_versions for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and exists (select 1 from public.proposals p where p.id = proposal_id and p.user_id = (select auth.uid())));
grant select, insert, update, delete on public.proposal_strategies, public.proposal_versions to authenticated; revoke all on public.proposal_strategies, public.proposal_versions from anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('portfolio','portfolio',false,10485760,array['application/pdf','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document']) on conflict (id) do nothing;
create policy "portfolio_files_select_own" on storage.objects for select to authenticated using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "portfolio_files_insert_own" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "portfolio_files_delete_own" on storage.objects for delete to authenticated using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text);
