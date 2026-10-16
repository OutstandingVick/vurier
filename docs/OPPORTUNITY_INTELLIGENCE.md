# Opportunity intelligence

Phase 3 adds evidence-based job analysis without proposal generation or application automation.

## Analysis pipeline

1. Load the authenticated user's verified skills, profile summary, portfolio, rates, categories, weights, and usage limits.
2. Wrap job descriptions as untrusted data. The system instruction forbids embedded instructions and invented evidence.
3. Use `deepseek-flash` for a Zod-validated screening assessment.
4. Calculate the weighted score deterministically. When screening marks a job promising and its score is at least 70, use `deepseek-v4-pro` for deeper assessment.
5. Persist the score with model lineage, factor evidence, weights, token usage, estimated cost, and an input fingerprint.

Missing factors have a `null` score and explicit reason. Available factors are reweighted for calculation, while confidence reports the percentage of configured weight supported by evidence. Missing client or job data is never an automatic penalty.

## Recommendations and weights

- Apply: 80–100
- Consider: 60–79
- Skip: 0–59

Defaults: skill match 30%, portfolio relevance 20%, budget/value 15%, competition 15%, client credibility 10%, and recency 10%. Users can change these in Settings, but they must total 100%.

## Cost, cache, and batches

Identical inputs are cached for 24 hours. Token counts come from provider responses. Displayed USD values use the estimates in `src/core/opportunities/cost.ts`, not provider invoices, and should be updated if pricing changes. Daily analysis and monthly estimated-spend limits are enforced per user.

Batches accept 1–25 jobs, persist progress in `agent_runs`, reject concurrent duplicate runs, check cancellation between jobs, continue past individual failures, and report completed/failed counts. Re-running unchanged inputs uses the cache; expired or changed inputs are analyzed again.

## Security boundaries

- The DeepSeek key stays in server code.
- Queries and mutations are scoped to the authenticated user.
- A database trigger rejects analyses for another user's job.
- Untrusted job text cannot expose secrets, change weights, select tools, or calculate the final score.
- Phase 3 never generates proposals, submits applications, or spends Connects.
