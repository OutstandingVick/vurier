# Production operations

Phase 8 prepares Vurier for production but does not deploy it. Deployment, paid services, proposal submission, boosting, and Connects spending still require explicit user action.

## Release order

1. Create a production Supabase backup and test restore access.
2. Apply migrations through `20261022000000_phase_8_analytics_production.sql` in staging, then production.
3. Configure the Vercel environment from `.env.example`. Keep every non-`NEXT_PUBLIC_` value server-only.
4. Configure the production Supabase Auth site URL and exact callback allowlists for Vercel and Upwork.
5. Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` against the release commit.
6. Deploy the web application to Vercel from the protected `main` branch.
7. Deploy Trigger.dev separately with the same server-only Supabase, Upwork, DeepSeek, encryption, and application URL values.
8. Run the smoke checklist below before enabling any schedule.

## Required production values

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPSEEK_API_KEY`, optionally `DEEPSEEK_BASE_URL`
- `APPROVAL_SIGNING_KEY` with at least 32 random characters
- `INTEGRATION_ENCRYPTION_KEY` containing exactly 32 random bytes encoded as base64
- `NEXT_PUBLIC_APP_URL`
- `TRIGGER_SECRET_KEY`, `TRIGGER_PROJECT_REF` when monitoring is enabled
- Upwork OAuth values only after official access and scopes are granted

Never reuse development signing or encryption keys in production. Rotation of the integration encryption key currently requires reconnecting provider accounts.

## Smoke checks

- Sign up, sign in, sign out, and session persistence.
- Two separate test users cannot read or mutate each other's jobs, analyses, proposals, applications, analytics, files, or integration status.
- Direct authenticated writes to application workflow and audit tables fail.
- A manual application cannot be marked submitted without an exact, unexpired approval.
- Two concurrent submissions cannot reserve more Connects than the configured limit.
- Two concurrent AI requests cannot reserve more than the monthly budget.
- A repeated monitoring idempotency key has one active lease.
- `/api/health` returns `200` without disclosing credentials or provider state.
- Analytics date/category filters and prior-period comparisons match SQL fixtures.
- Mobile layouts remain usable at 320 px and keyboard focus remains visible.

## Incident and rollback

Disable monitoring schedules first. Revoke affected provider tokens, rotate the relevant server secret, and invalidate active Vercel/Trigger deployments if credentials may be exposed. Preserve `operational_events`, monitoring errors, application audit logs, and submission attempts. Never retry an uncertain proposal submission until its Upwork state is reconciled.

Application rollback should use the prior Vercel deployment. Database migrations are forward-only; restore from the verified backup for destructive rollback. Do not remove audit, approval, reservation, or idempotency records to force a retry.
