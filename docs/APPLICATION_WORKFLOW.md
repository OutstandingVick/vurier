# Application workflow

Phase 5 converts a saved proposal version into an application package and moves it through `draft → ready_for_review → approved → submitting → submitted/failed`. Every approval covers the exact package fingerprint, bid, application and boost Connects costs, and application version. It expires after 15 minutes and carries a server-generated HMAC signature. Preparing a new package or saving a material proposal edit increments the version and invalidates prior approval.

## Upwork capability boundary

The adapter calls only Upwork's official GraphQL API. Submission is enabled only when the stored connection reports the exact `Submit Proposal` permission and the package contains provider-required input. Connects balance display separately requires `Ad Credits and Connects Information - Read-Only Access`; status synchronization requires the proposal-status permission.

Permissions and provider input vary by approved API consumer. When either is absent, Vurier switches to an explicitly labeled manual fallback: it shows copyable package details and the permitted Upwork link. URL navigation and status labels never imply submission. The user must confirm a manual submission before Vurier records it.

## Safety and recovery

- Submission attempts have a deterministic idempotency key and a database uniqueness constraint.
- An uncertain network outcome is never retried automatically. The application is held for reconciliation.
- Daily and monthly Connects limits are checked at approval; Connects are recorded only after a confirmed API result.
- Remote balances and statuses are shown only when returned by Upwork. Missing values remain unavailable.
- User-owned status history, notification, audit, attempt, and spending records are protected by RLS.

No background submission, browser automation, scraping, Connects purchasing, or boosting outside the approved package exists in Phase 5.
