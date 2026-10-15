# Upwork integration

## Access status

No Upwork API credentials were available during Phase 2 implementation, so live authorized retrieval was not executed. The connection remains disabled unless every required environment variable is present. Contract tests cover OAuth requests, GraphQL normalization, permission failures, rate limits, and malformed payloads without representing test fixtures as live jobs.

Upwork currently documents OAuth 2.0, the `https://api.upwork.com/graphql` endpoint, and the `marketplaceJobPostingsSearch` query. An approved API key with **Read marketplace Job Postings** and common-entity access is required. Upwork reviews API-key applications and may not grant access to every account.

## Configuration

Set `UPWORK_CLIENT_ID`, `UPWORK_CLIENT_SECRET`, `UPWORK_REDIRECT_URI`, `UPWORK_API_BASE_URL`, `UPWORK_AUTH_BASE_URL`, `UPWORK_SCOPES`, `SUPABASE_SERVICE_ROLE_KEY`, and a 32-byte base64 `INTEGRATION_ENCRYPTION_KEY`. Register the exact redirect URI in Upwork API Center.

The API base URL is `https://api.upwork.com`; OAuth authorization and token exchange use `https://www.upwork.com`. Do not expose the client secret, service-role key, encryption key, or provider tokens to browser code.

## Limits and fallback

Vurier does not scrape Upwork, extract cookies, solve CAPTCHAs, or automate the Upwork website. Provider rate limits, permission failures, and GraphQL error arrays are surfaced as recoverable states. Upwork-derived feed data is shown only within its documented 24-hour cache window.

When official access is unavailable, users may paste an Upwork job URL plus the title and description they already have. URL-only import never fetches restricted content. The canonical URL supplies a stable duplicate key; all other displayed values come directly from the user.
