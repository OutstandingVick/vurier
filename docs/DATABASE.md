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

All user data references `auth.users`, cascades safely where appropriate, and is isolated by RLS. Apply migrations using `supabase db push` after linking a project, or run the SQL migration in the Supabase SQL editor.
