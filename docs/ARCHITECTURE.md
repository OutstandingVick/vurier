# Vurier architecture

## Phase boundary

Phase 1 provides identity and secure infrastructure. Phase 2 adds authorized discovery. Phase 3 adds opportunity analysis. Phase 4 adds verified portfolio knowledge, proposal strategy, grounded drafting, QA, and versioned editing. It does not schedule monitoring, notify users, submit applications, deploy demos, or spend Connects.

## Layers

- `src/app`: App Router pages, route handlers, and authenticated Server Actions.
- `src/components`: presentation and form components grouped by product area.
- `src/core`: provider-neutral domain contracts and permanent approval policy.
- `src/integrations`: replaceable external gateways. Upwork is represented only by an authorized API/MCP contract.
- `src/lib`: infrastructure clients for Supabase, DeepSeek, and validated environment access.
- `supabase/migrations`: PostgreSQL schema, indexes, triggers, grants, and row-level security.

## Security boundaries

Supabase sessions use HTTP-only cookies through `@supabase/ssr`. Protected routes verify the user with `auth.getUser()`, and every data table has ownership-based RLS. DeepSeek credentials are read only in server modules. The browser never receives the API key.

Proposal submission and Connects spending are guarded actions. The domain policy requires a matching approval record; database policy additionally prevents application insertion unless the related proposal has `approved_at` set. The settings schema forces both approval flags to remain enabled.

## AI client

`DeepSeekClient` supports `deepseek-flash` and `deepseek-v4-pro`, low/medium/high reasoning effort, optional Zod-validated JSON output, abort signals, provider errors, retryability hints, request IDs, and input/output/total token accounting. Call it from server-only workflows in later phases.

## Future adapters

The `UpworkGateway`, `OpportunityScorer`, `ProposalGenerator`, `BackgroundScheduler`, and `Notifier` interfaces keep providers replaceable. Trigger.dev should implement `BackgroundScheduler` only when background runs enter scope. Upwork access must use an authorized integration; scraping and browser automation are explicitly out of scope.

## Discovery flow

The Upwork adapter uses OAuth 2.0 Authorization Code with PKCE and the official GraphQL endpoint. OAuth state and verifier values live in short-lived HTTP-only cookies. Access and refresh tokens are encrypted with AES-256-GCM before service-role storage. A per-user token bucket limits bursts, provider 429 responses preserve retry guidance, and GraphQL error arrays are handled even when HTTP status is 200.

Provider records and manual records normalize into `NormalizedJob`. Each record retains its permitted source, stable external ID, retrieval time, original permitted payload, and an explicit list of fields the source did not provide. Upwork-derived feed records are excluded after 24 hours to respect the documented cache limit; manual records remain because the user supplied them.

## Opportunity intelligence flow

`core/opportunities` owns the validated AI schema, prompt isolation, deterministic scoring, caching, quota checks, cost estimates, and persistence mapping. Server actions load only the authenticated user's job and evidence, screen with Flash, conditionally escalate to V4 Pro, and persist the inputs used for each recommendation.

The model assesses evidence but never calculates the final weighted score. Configurable weights, thresholds, unavailable-data behavior, and labels remain reproducible and unit-testable. Batches use `agent_runs`, allowing a later Trigger.dev adapter without changing the scoring domain.

## Proposal workflow

`core/proposals` owns evidence matching, untrusted-input prompts, structured strategy/draft schemas, cost calculation, quality checks, and versioning. V4 Pro produces strategy once; Flash produces and rewrites copy. Server actions are the authenticated orchestration boundary and persist through repository functions.

Portfolio files remain private in Supabase Storage. Evidence must be explicitly verified before matching. The editor creates a version on every save, and no route or component calls a submission gateway. Existing explicit approval policies remain intact for future submission work.
