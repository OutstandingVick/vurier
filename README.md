# Vurier

Vurier is a personal opportunity-intelligence agent for high-fit Upwork work. The repository currently contains Phase 1 foundations and the **Phase 2 Job Discovery Engine**.

## Local setup

1. Install Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env.local` and enter a Supabase project URL, anon key, and server-only DeepSeek key.
3. Apply `supabase/migrations/20261015000000_phase_1_foundation.sql` to the Supabase project.
4. In Supabase Auth, enable email/password and add `http://localhost:3000/auth/callback` as a redirect URL.
5. For official Upwork discovery, request an approved OAuth 2.0 API key, add the Upwork values from `.env.example`, and register the callback URL. Generate `INTEGRATION_ENCRYPTION_KEY` with `openssl rand -base64 32`.
6. Run `npm run dev` and open `http://localhost:3000`.

When environment values are absent, the marketing and dashboard UI can build for review, and Settings reports each missing connection honestly. Authentication and persistence require Supabase credentials.

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

See [Architecture](docs/ARCHITECTURE.md), [Database](docs/DATABASE.md), and [Upwork integration](docs/UPWORK_INTEGRATION.md) for implementation details. Phase 3 must not begin without approval.
