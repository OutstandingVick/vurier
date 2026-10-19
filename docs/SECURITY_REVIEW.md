# Phase 8 security review

The source review covered authentication, server actions, Supabase RLS and grants, application approval and spending, OAuth, encrypted credentials, AI boundaries, URL retrieval, monitoring concurrency, provider rate limits, notifications, and deployment headers.

## Remediated in Phase 8

- Connects are reserved atomically under a per-user database lock immediately before submission and finalized idempotently after confirmation.
- AI workflows reserve a bounded amount against the monthly budget before paid model calls.
- Monitoring invocations acquire an expiring database lease; duplicate workers do not repeat paid analysis.
- Upwork requests use a durable database-backed limiter shared across serverless instances.
- OAuth callbacks must match the Vurier user who initiated the flow.
- Application relationships are validated as one same-tenant job/proposal/version chain.
- Authenticated browser clients retain read access but lose direct mutation access to authoritative application, submission, ledger, history, notification, and audit tables. Trusted server actions use the service role after authenticating and scoping the user.
- The browser reads a credential-free integration-status view and cannot select encrypted token columns.
- New credential envelopes bind ciphertext to the user, provider, and token kind; legacy ciphertext remains readable for migration.
- Reference verification pins the HTTPS connection to the public IP address that passed validation, blocks reserved ranges, and refuses redirects.
- Proposal factual QA no longer treats client job text as evidence of freelancer achievements.
- DeepSeek, Upwork, Telegram, and reference requests have explicit time limits; DeepSeek output is capped.
- Security headers disable framing, MIME sniffing, unnecessary browser capabilities, and broad referrer leakage.

## Requires deployment validation

- Run real two-principal Supabase tests against the deployed migration; static SQL tests cannot prove hosted policy drift is absent.
- Confirm Vercel, Supabase Auth, Trigger.dev, Telegram, and Upwork production allowlists and permissions in their control planes.
- Confirm Upwork's proposal mutation honors the supplied idempotency header. Uncertain outcomes remain non-retryable until reconciliation.
- Validate CSP against the final production domains and tighten `connect-src` after all authorized provider hosts are known.
- The repository has no third-party error-monitoring credential. Structured logs and persisted operational records are available, but external alert routing must be configured by the operator.
