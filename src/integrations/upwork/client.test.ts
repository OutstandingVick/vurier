import { afterEach, describe, expect, it, vi } from "vitest";
import { UpworkApiClient } from "@/integrations/upwork/client";
import { UpworkPermissionError, UpworkRateLimitError } from "@/integrations/upwork/errors";

afterEach(() => vi.unstubAllEnvs());
function configure() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
  vi.stubEnv("DEEPSEEK_API_KEY", "deepseek");
  vi.stubEnv("UPWORK_API_BASE_URL", "https://api.upwork.test");
}

describe("UpworkApiClient", () => {
  it("retrieves and normalizes authorized jobs", async () => {
    configure();
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ data: { marketplaceJobPostingsSearch: { edges: [{ cursor: "next", node: { id: "job_1", ciphertext: "~job_1", title: "Next.js engineer", description: "Build a dashboard", amount: { amount: 2000, currencyCode: "USD" } } }], totalCount: 1, pageInfo: { hasNextPage: false } } } }), { status: 200 }));
    const result = await new UpworkApiClient(fetcher).searchJobs("access", { query: "Next.js", pageSize: 20 }, "user-1");
    expect(result.jobs[0]).toMatchObject({ externalId: "job_1", source: "upwork_api" });
    const request = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(request.variables.filter.searchExpression_eq).toBe("Next.js");
  });
  it("surfaces permission failures", async () => {
    configure();
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}", { status: 403 }));
    await expect(new UpworkApiClient(fetcher).searchJobs("access", {}, "user-1")).rejects.toBeInstanceOf(UpworkPermissionError);
  });
  it("honors provider retry windows", async () => {
    configure();
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}", { status: 429, headers: { "retry-after": "90" } }));
    await expect(new UpworkApiClient(fetcher).searchJobs("access", {}, "user-1")).rejects.toMatchObject({ retryAfterSeconds: 90 } satisfies Partial<UpworkRateLimitError>);
  });
  it("detects GraphQL permission errors returned with HTTP 200", async () => {
    configure();
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ errors: [{ message: "not enough oauth2 permissions/scopes" }] }), { status: 200 }));
    await expect(new UpworkApiClient(fetcher).searchJobs("access", {}, "user-1")).rejects.toBeInstanceOf(UpworkPermissionError);
  });
});
