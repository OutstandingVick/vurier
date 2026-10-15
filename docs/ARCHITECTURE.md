# Vurier architecture

## Phase boundary

Phase 1 provides identity, persistence, secure AI access, the dashboard shell, editable preferences, and replaceable service contracts. It does not discover jobs, score opportunities, generate proposals, schedule agents, notify users, submit applications, or spend Connects.

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
