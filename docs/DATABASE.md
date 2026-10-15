# Database model

The initial migration creates:

- `profiles`: freelancer positioning and reusable skills.
- `portfolio_items`: user-owned evidence for later proposal personalization.
- `jobs`: normalized authorized-source jobs plus the original JSON payload.
- `job_analyses`: model scores, rationale, risk signals, and token usage.
- `proposals`: reviewable drafts, bid information, model usage, and approval time.
- `applications`: user-approved submissions and Connects spent.
- `agent_runs`: workflow status, errors, metadata, and aggregate model usage.
- `settings`: categories, economic thresholds, AI defaults, and immutable approval guardrails.
- `discovery_sources`: encrypted authorized-provider connection metadata and status.
- `saved_searches`: reusable user-owned queries and structured filter objects.
- `job_user_states`: saved, bookmarked, hidden, or tracked opportunity state.

Phase 2 extends `jobs` with normalized contract, budget, skill, client, competition, retrieval, and missing-field columns. The `(user_id, source, external_id)` uniqueness rule prevents duplicate provider and manual records. A generated English `tsvector` and GIN indexes support low-cost keyword and skill search.

All user data references `auth.users`, cascades safely where appropriate, and is isolated by RLS. Apply migrations using `supabase db push` after linking a project, or run the SQL migration in the Supabase SQL editor.

Authenticated browser sessions cannot write `discovery_sources`; only trusted service-role code stores encrypted tokens. Saved searches and job states require `auth.uid() = user_id`, and job-state insertion additionally verifies ownership of the referenced job.
