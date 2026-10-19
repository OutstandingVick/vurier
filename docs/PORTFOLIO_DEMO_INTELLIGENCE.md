# Portfolio and demo intelligence

Phase 7 adds a review-first proof-of-work workflow. It never builds, deploys, publishes, attaches, or submits work autonomously.

## Workflow

1. Open an analyzed opportunity and choose **Evaluate proof of work**.
2. Vurier ranks only verified portfolio evidence against the opportunity.
3. DeepSeek V4 Pro evaluates the client problem, differentiation, effort, and reusable evidence. Deterministic code combines those inputs with known budget, competition, credibility, and recency signals.
4. The result is **Build**, **Reuse**, or **Skip**. Missing inputs lower confidence but do not become negative evidence.
5. DeepSeek Flash creates an editable brief and a Claude/Codex implementation prompt. Writing and research opportunities receive an appropriate sample or report brief rather than an unrelated website.
6. Add reference URLs manually. Vurier accepts HTTPS public-network URLs only and verifies a successful response before saving them. No search provider is configured in Phase 7, so Vurier does not claim to have discovered references automatically.
7. Track a draft or upload a finished artifact. A user must mark it completed and verified before it can appear in the proposal editor.
8. Attaching a verified asset creates a new proposal version. This is a material application change, so any existing Phase 5 approval is invalidated.

## Models and cost controls

- `deepseek-v4-pro`: one strategic proof-of-work assessment.
- `deepseek-flash`: one structured brief and implementation prompt.
- Matching, ROI, confidence, caching, and attachment eligibility are deterministic.
- The cache fingerprint includes the job revision, opportunity analysis, ranked evidence, and Phase 7 prompt version.
- The existing monthly AI budget aggregates opportunity analysis, proposal strategy, and demo-intelligence cost before generation. A reserve estimate prevents starting when the remaining budget is too low.

Actual costs are stored from provider token usage using the estimates in `src/core/opportunities/cost.ts`. Pricing constants are estimates and should be updated when the configured provider contract changes.

## Security and integrity

- All generation happens in authenticated server actions; DeepSeek credentials never reach the browser.
- Job descriptions are explicitly delimited as untrusted input.
- Model-selected evidence IDs are intersected with verified, user-owned records before persistence.
- Database triggers and RLS repeat ownership checks, including same-opportunity checks for proposal attachments.
- Demo uploads use a private Supabase bucket scoped to the authenticated user's folder.
- Reference validation blocks credentials, HTTP, localhost, private/link-local addresses, and redirects. A verified response confirms reachability, not the truth of the page's claims; users remain responsible for relevance and factual review.

## Manual verification

With Supabase and DeepSeek configured, verify:

1. Add and verify portfolio evidence.
2. Analyze a saved job, generate a demo strategy, and confirm its decision and evidence reasons.
3. Edit and save the brief JSON and implementation prompt.
4. Add a public HTTPS reference and confirm invalid/private URLs fail.
5. Save an in-progress asset and confirm it cannot be attached.
6. Complete and verify an asset, attach it to the matching proposal, and confirm a new proposal version is created and prior application approval is invalidated.
