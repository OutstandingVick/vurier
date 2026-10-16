alter table public.profiles add column if not exists verified_skills text[] not null default '{}';

alter table public.settings
  add column if not exists scoring_weights jsonb not null default '{"skillMatch":30,"portfolioRelevance":20,"budgetValue":15,"competition":15,"clientCredibility":10,"recency":10}',
  add column if not exists daily_analysis_limit integer not null default 25 check (daily_analysis_limit between 1 and 200),
  add column if not exists monthly_ai_budget_usd numeric(10,2) not null default 10 check (monthly_ai_budget_usd between 0.01 and 1000);

alter table public.settings add constraint scoring_weights_total_check check (
  jsonb_typeof(scoring_weights) = 'object' and
  (scoring_weights->>'skillMatch')::numeric >= 0 and
  (scoring_weights->>'portfolioRelevance')::numeric >= 0 and
  (scoring_weights->>'budgetValue')::numeric >= 0 and
  (scoring_weights->>'competition')::numeric >= 0 and
  (scoring_weights->>'clientCredibility')::numeric >= 0 and
  (scoring_weights->>'recency')::numeric >= 0 and
  (scoring_weights->>'skillMatch')::numeric + (scoring_weights->>'portfolioRelevance')::numeric + (scoring_weights->>'budgetValue')::numeric + (scoring_weights->>'competition')::numeric + (scoring_weights->>'clientCredibility')::numeric + (scoring_weights->>'recency')::numeric = 100
);

alter table public.job_analyses
  add column if not exists screening_model text not null default 'deepseek-flash',
  add column if not exists deep_model text,
  add column if not exists model_version text not null default 'phase3-v1',
  add column if not exists recommendation text check (recommendation in ('apply', 'consider', 'skip')),
  add column if not exists factor_scores jsonb not null default '{}',
  add column if not exists scoring_weights jsonb not null default '{}',
  add column if not exists gaps jsonb not null default '[]',
  add column if not exists estimated_cost_usd numeric(12,6) not null default 0 check (estimated_cost_usd >= 0),
  add column if not exists input_fingerprint text,
  add column if not exists feedback text check (feedback in ('accurate', 'inaccurate')),
  add column if not exists feedback_note text check (feedback_note is null or char_length(feedback_note) <= 1000),
  add column if not exists feedback_at timestamptz;

create unique index if not exists job_analyses_fingerprint_unique on public.job_analyses(user_id, job_id, input_fingerprint) where input_fingerprint is not null;
create index if not exists job_analyses_ranked_idx on public.job_analyses(user_id, overall_score desc, created_at desc);
create index if not exists job_analyses_usage_idx on public.job_analyses(user_id, created_at desc) include (estimated_cost_usd, input_tokens, output_tokens);

create or replace function public.validate_analysis_ownership() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if not exists (select 1 from public.jobs where id = new.job_id and user_id = new.user_id) then
    raise exception 'Analysis job must belong to user';
  end if;
  return new;
end;
$$;
create trigger job_analyses_validate_ownership before insert or update on public.job_analyses for each row execute function public.validate_analysis_ownership();

-- Batch jobs reuse agent_runs; this index prevents concurrent duplicate analysis runs.
create unique index if not exists agent_runs_one_active_analysis on public.agent_runs(user_id, run_type) where run_type = 'opportunity_analysis' and status in ('queued', 'running');
