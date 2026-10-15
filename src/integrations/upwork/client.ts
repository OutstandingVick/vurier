import type { JobSearchFilters, NormalizedJob } from "@/core/jobs/types";
import { getServerEnv } from "@/lib/env";
import { UpworkApiError, UpworkPermissionError, UpworkRateLimitError } from "@/integrations/upwork/errors";
import { normalizeUpworkJob } from "@/integrations/upwork/normalizer";
import { TokenBucketRateLimiter } from "@/integrations/upwork/rate-limiter";

type GraphQlResponse = { data?: { marketplaceJobPostingsSearch?: { edges?: Array<{ cursor?: string; node?: Record<string, unknown> }>; pageInfo?: { endCursor?: string; hasNextPage?: boolean }; totalCount?: number } }; errors?: Array<{ message?: string; extensions?: { code?: string } }> };
export type UpworkSearchResult = { jobs: NormalizedJob[]; nextCursor?: string; total?: number };

const MARKETPLACE_SEARCH = `query VurierMarketplaceJobs($filter: MarketplaceJobPostingsSearchFilter, $sort: [MarketplaceJobPostingSearchSortAttribute]) {
  marketplaceJobPostingsSearch(marketPlaceJobFilter: $filter, searchType: USER_JOBS_SEARCH, sortAttributes: $sort) {
    totalCount
    edges { cursor node { id ciphertext title description amount { amount currencyCode } experienceLevel category createdDateTime publishedDateTime totalApplicants skills { name prettyName } client { totalSpent { amount currencyCode } verificationStatus totalFeedback location { country } } } }
    pageInfo { endCursor hasNextPage }
  }
}`;

function providerPayload(node: Record<string, unknown>) {
  const client = typeof node.client === "object" && node.client ? node.client as Record<string, unknown> : {};
  const amount = typeof node.amount === "object" && node.amount ? node.amount as Record<string, unknown> : {};
  const totalSpent = typeof client.totalSpent === "object" && client.totalSpent ? client.totalSpent as Record<string, unknown> : {};
  const location = typeof client.location === "object" && client.location ? client.location as Record<string, unknown> : {};
  return { ...node, id: node.id ?? node.ciphertext, url: node.ciphertext ? `https://www.upwork.com/jobs/${node.ciphertext}` : null, type: amount.amount ? "fixed" : "unknown", budget: { min: amount.amount, max: amount.amount, currency: amount.currencyCode }, experience_level: node.experienceLevel, published_at: node.publishedDateTime ?? node.createdDateTime, proposals: proposalBucket(node.totalApplicants), client: { country: location.country, payment_verified: client.verificationStatus === "VERIFIED" ? true : client.verificationStatus === "UNVERIFIED" ? false : undefined, rating: client.totalFeedback, total_spent: totalSpent.amount }, skills: node.skills };
}

function proposalBucket(value: unknown) {
  if (typeof value !== "number") return "unknown";
  if (value < 5) return "less_than_5";
  if (value <= 10) return "5_to_10";
  if (value <= 15) return "10_to_15";
  if (value <= 20) return "15_to_20";
  if (value <= 50) return "20_to_50";
  return "50_plus";
}

export class UpworkApiClient {
  private readonly limiter = new TokenBucketRateLimiter();
  constructor(private readonly fetcher: typeof fetch = fetch) {}

  async searchJobs(accessToken: string, filters: JobSearchFilters, userId: string, cursor?: string): Promise<UpworkSearchResult> {
    this.limiter.consume(userId);
    const env = getServerEnv();
    const filter: Record<string, unknown> = { pagination_eq: { first: filters.pageSize ?? 20, ...(cursor ? { after: cursor } : {}) } };
    if (filters.query) filter.searchExpression_eq = filters.query;
    const response = await this.fetcher(new URL("/graphql", env.UPWORK_API_BASE_URL), { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ query: MARKETPLACE_SEARCH, variables: { filter, sort: [{ field: filters.sort === "newest" ? "RECENCY" : "RELEVANCE" }] } }), cache: "no-store" });
    if (response.status === 401 || response.status === 403) throw new UpworkPermissionError();
    if (response.status === 429) throw new UpworkRateLimitError(Number(response.headers.get("retry-after")) || 60);
    const payload = await response.json().catch(() => ({})) as GraphQlResponse;
    const graphError = payload.errors?.[0];
    if (graphError) {
      const message = graphError.message ?? "Upwork GraphQL search failed.";
      if (/permission|scope|authorized/i.test(message)) throw new UpworkPermissionError(message);
      if (/rate|limit|thrott/i.test(message)) throw new UpworkRateLimitError();
      throw new UpworkApiError(message, response.status, graphError.extensions?.code);
    }
    if (!response.ok) throw new UpworkApiError("Upwork GraphQL search failed.", response.status);
    const connection = payload.data?.marketplaceJobPostingsSearch;
    const jobs = (connection?.edges ?? []).flatMap((edge) => edge.node ? [normalizeUpworkJob(providerPayload(edge.node))] : []);
    return { jobs, nextCursor: connection?.pageInfo?.hasNextPage ? connection.pageInfo.endCursor : undefined, total: connection?.totalCount };
  }
}
