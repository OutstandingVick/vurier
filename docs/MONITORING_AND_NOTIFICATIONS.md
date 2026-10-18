# Monitoring and notifications

Phase 6 adds multi-tenant Trigger.dev schedules for authorized Upwork discovery. Each schedule is attached to `vurier-monitor-jobs` with the user ID as its external ID. Runs are limited to one concurrent execution per user and ten globally, retried with exponential backoff, capped at five minutes, and protected by a database idempotency key.

## Workflow

1. Load the user's active schedule, saved searches, profile, portfolio evidence, scoring weights, and limits.
2. Retrieve jobs through the existing authorized Upwork GraphQL adapter. A disconnected or permission-denied integration is skipped or paused; no fallback scraping exists.
3. Deduplicate stable Upwork IDs, then prioritize recent jobs and lower known competition.
4. Analyze only new jobs through the Phase 3 engine. Flash screens every candidate and V4 Pro remains conditional.
5. Alert only when the deterministic score, known budget preferences, notification quota, and quiet-hours policy pass.
6. Persist every run, error, delivery attempt, and in-app notification. Telegram success is recorded only after Telegram returns a message ID.

## Trigger.dev setup

Set `TRIGGER_SECRET_KEY` and `TRIGGER_PROJECT_REF`, then run `npx trigger.dev@latest dev` locally or `npx trigger.dev@latest deploy` for production. Set the same Supabase, DeepSeek, Upwork, encryption, and `NEXT_PUBLIC_APP_URL` values in the Trigger.dev environment. Schedules cannot be enabled without a Trigger secret.

## Telegram setup

Create a bot through Telegram's official BotFather flow, start a chat with it, and enter the bot token and chat ID in Monitoring. The token is encrypted with `INTEGRATION_ENCRYPTION_KEY`; it is never returned to the browser or logged. Re-entering a token replaces the saved credential.

Quiet hours suppress new delivery attempts. Notification quotas and daily/monthly AI budgets stop additional work rather than fabricating or deferring alerts.

Phase 6 does not submit proposals, spend Connects, deploy demos, or automate the Upwork website.
