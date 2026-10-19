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

Phase 3 adds `profiles.verified_skills`; scoring weights and usage limits to `settings`; and model lineage, factor evidence, gaps, cost estimates, fingerprints, and feedback to `job_analyses`. Ranked and usage indexes support the dashboard and quota aggregation. An ownership trigger prevents any analysis from referencing another user's job, while a partial unique index permits only one active opportunity-analysis batch per user.

Phase 4 extends `portfolio_items` with evidence kind, verified achievements, private file path, verification state, and category. `proposal_strategies` stores the V4 Pro reasoning result and selected evidence. `proposal_versions` stores immutable generated, rewritten, and manual revisions with QA snapshots. `proposals` stores current application estimates, milestones, screening answers, attachments, and QA.

RLS checks authenticated ownership and referenced job/proposal ownership. Storage policies limit the private `portfolio` bucket to paths whose first folder matches `auth.uid()`. Anonymous access is revoked.

Phase 5 extends `applications` with a proposal-version reference, immutable package snapshot, application version, exact costs, manual/uncertain flags, and a per-user job uniqueness constraint. `application_approvals` stores short-lived signed confirmations. `application_status_history`, `submission_attempts`, `connects_ledger`, `notifications`, and `application_audit_logs` preserve the workflow and recovery trail. Settings hold non-negative daily and monthly Connects limits.

All Phase 5 tables enforce user ownership with RLS. Attempt idempotency is globally unique, ledger amounts cannot be negative, and application insertion verifies ownership of the related proposal.

Phase 6 adds `monitoring_schedules`, `notification_preferences`, `monitoring_runs`, `notification_deliveries`, and `monitoring_errors`. Unique run and delivery keys make Trigger retries safe. Notification rows gain category, action URL, and dismissal fields. Settings gain a non-negative daily AI budget.

Authenticated users may manage only their schedule and preference rows. Run, delivery, and error history is read-only through authenticated sessions; the background worker writes it with the service role. Telegram tokens are stored only as encrypted ciphertext.

Phase 7 adds `demo_strategies`, `demo_references`, `demo_assets`, and `proposal_demo_assets`. Strategies retain deterministic ROI factors, unavailable inputs, model lineage, selected verified evidence, token usage, estimated cost, brief, and implementation prompt. References retain their source and verification response; assets retain progress and explicit user verification.

RLS isolates every row by user and referenced ownership. A trigger rejects unverified or foreign portfolio evidence. Proposal links accept only completed, verified assets produced for the same job. Demo files live in the private `demos` bucket under a user-owned path.

Phase 8 adds outcome and time fields, external expenses, bounded ranking adjustments, operational events, integration health, Connects and AI-cost reservations, and a durable provider limiter. Analytics indexes cover user/date/category/status access paths. Application and proposal triggers validate the full same-tenant relationship chain.

Authenticated clients can read but cannot directly mutate authoritative application workflow, submission, ledger, audit, or notification tables. Trusted authenticated server actions perform those writes with the service role and explicit user scoping. `discovery_source_status` exposes connection metadata without encrypted token ciphertext.
