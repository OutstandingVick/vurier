# Vurier architecture

## Phase boundary

Phase 1 provides identity and secure infrastructure. Phase 2 adds authorized discovery. Phase 3 adds opportunity analysis. Phase 4 adds verified portfolio knowledge and grounded proposals. Phase 5 adds explicit-approval applications. Phase 6 adds authorized scheduled discovery, cost-aware analysis, and in-app and Telegram alerts. Phase 7 adds portfolio matching and user-reviewed proof-of-work strategy. It does not autonomously submit, purchase Connects, build, publish, or deploy demos.

## Layers

- `src/app`: App Router pages, route handlers, and authenticated Server Actions.
- `src/components`: presentation and form components grouped by product area.
- `src/core`: provider-neutral domain contracts and permanent approval policy.
- `src/integrations`: replaceable external gateways. Upwork is represented only by an authorized API/MCP contract.
- `src/lib`: infrastructure clients for Supabase, DeepSeek, and validated environment access.
- `supabase/migrations`: PostgreSQL schema, indexes, triggers, grants, and row-level security.

## Security boundaries

Supabase sessions use HTTP-only cookies through `@supabase/ssr`. Protected routes verify the user with `auth.getUser()`, and every data table has ownership-based RLS. DeepSeek credentials are read only in server modules. The browser never receives the API key.

Proposal submission and Connects spending are guarded actions. The domain policy requires a current, unexpired, HMAC-signed approval matching the package fingerprint and application version. Material proposal edits invalidate approval. Idempotency records prevent duplicate attempts; uncertain outcomes require reconciliation instead of automatic retry.

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

Portfolio files remain private in Supabase Storage. Evidence must be explicitly verified before matching. The editor creates a version on every save. Phase 5 can prepare that immutable version as an application package; later edits return reviewable applications to draft.

## Application workflow

`core/applications` owns package preparation, fingerprints, signed approval policy, state transitions, spending limits, idempotency, provider capabilities, and status mapping. Authenticated server actions orchestrate persistence. The Upwork adapter is the only submission boundary and is invoked only after approval and permission checks. Manual fallback never reports provider confirmation.

## Scheduled monitoring

Trigger.dev owns durable timing, retries, maximum duration, and per-user concurrency. `core/monitoring` owns provider-neutral eligibility, quiet hours, limits, ranking, idempotency, and workflow orchestration. Supabase remains the source of truth for schedules and run outcomes, so a Trigger replay cannot duplicate a completed run or alert.

Telegram is a replaceable delivery adapter. Bot tokens use the existing AES-256-GCM vault and are read only by trusted server/background code. In-app notifications retain user ownership and link to persisted opportunities.

## Portfolio and demo intelligence

`core/demos` owns verified-evidence ranking, artifact-kind selection, deterministic ROI, structured model schemas, untrusted-input prompts, budget checks, caching, URL safety, and attachment eligibility. V4 Pro supplies strategic judgment; Flash supplies the editable brief and implementation prompt. Neither model controls the final ROI formula or attachment approval.

Authenticated server actions load owned jobs and verified portfolio records, sanitize model-selected IDs against that set, and persist through the Phase 7 repository. The database repeats ownership validation with RLS and a trigger. A completed demo is still not proposal evidence until the user explicitly verifies and attaches it. That attachment creates a new proposal version and flows through the existing application-approval invalidation boundary.
