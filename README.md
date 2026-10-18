# Vurier

Vurier is a personal opportunity-intelligence agent for high-fit Upwork work. The repository contains Phases 1–6: foundation, authorized discovery, opportunity intelligence, proposal writing, explicit-approval applications, and **Scheduled Monitoring & Notifications**.

## Local setup

1. Install Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env.local` and enter a Supabase project URL, anon key, and server-only DeepSeek key.
3. Apply every migration in `supabase/migrations` in timestamp order.
4. In Supabase Auth, enable email/password and add `http://localhost:3000/auth/callback` as a redirect URL.
5. Generate `APPROVAL_SIGNING_KEY` with `openssl rand -hex 32`. Application approval is disabled until it is configured.
6. For official Upwork access, request an approved OAuth 2.0 API key, add the Upwork values from `.env.example`, and register the callback URL. Generate `INTEGRATION_ENCRYPTION_KEY` with `openssl rand -base64 32`. Submission, Connects balance, and status sync each remain disabled unless Upwork granted the corresponding permission.
7. For scheduled monitoring, add the Trigger.dev project values and `NEXT_PUBLIC_APP_URL`, then run `npx trigger.dev@latest dev` alongside the app. Keep the same server credentials in Trigger.dev.
8. Run `npm run dev` and open `http://localhost:3000`.

When environment values are absent, the marketing and dashboard UI can build for review, and Settings reports each missing connection honestly. Authentication and persistence require Supabase credentials. Without `DEEPSEEK_API_KEY`, saved jobs still work but analysis stays disabled and no synthetic results are shown.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

## Product guardrails

- Only authorized Upwork integrations may be used. No scraping or browser automation.
- Vurier may analyze and prepare work in future phases.
- Submitting proposals and spending Connects always require explicit user approval.
- Empty states never represent seeded or mock records as live information.

See [Architecture](docs/ARCHITECTURE.md), [Database](docs/DATABASE.md), [Upwork integration](docs/UPWORK_INTEGRATION.md), [Opportunity intelligence](docs/OPPORTUNITY_INTELLIGENCE.md), [Proposal writer](docs/PROPOSAL_WRITER.md), [Application workflow](docs/APPLICATION_WORKFLOW.md), and [Monitoring and notifications](docs/MONITORING_AND_NOTIFICATIONS.md). Phase 7 must not begin without approval.
