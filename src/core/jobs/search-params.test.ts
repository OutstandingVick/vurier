import { describe, expect, it } from "vitest";
import { parseSearchParams, searchParamsFor } from "@/core/jobs/search-params";

describe("job search parameters", () => {
  it("parses filters with safe defaults", () => {
    const filters = parseSearchParams({
      query: "React",
      jobType: "hourly",
      page: "2",
      minimumBudget: "50",
    });
    expect(filters).toMatchObject({
      query: "React",
      jobType: "hourly",
      page: 2,
      minimumBudget: 50,
      sort: "newest",
    });
  });
  it("rejects malformed pagination", () => {
    expect(() => parseSearchParams({ page: "-1" })).toThrow();
  });
  it("preserves filters while changing pages", () => {
    const query = searchParamsFor(
      { query: "fintech", jobType: "fixed", page: 1 },
      { page: 3 },
    );
    expect(query).toContain("query=fintech");
    expect(query).toContain("page=3");
  });
});
