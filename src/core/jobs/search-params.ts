import { jobSearchSchema } from "@/core/jobs/schema";
import type { JobSearchFilters } from "@/core/jobs/types";

export function parseSearchParams(params: Record<string, string | string[] | undefined>) {
  const first = (key: string) => Array.isArray(params[key]) ? params[key]?.[0] : params[key];
  return jobSearchSchema.parse({ query: first("query"), category: first("category"), jobType: first("jobType"), experienceLevel: first("experienceLevel"), paymentVerified: first("paymentVerified"), proposalCount: first("proposalCount"), minimumBudget: first("minimumBudget"), maximumAgeHours: first("maximumAgeHours"), sort: first("sort"), page: first("page"), pageSize: first("pageSize") });
}

export function searchParamsFor(filters: JobSearchFilters, overrides: Record<string, string | number | undefined> = {}) {
  const values = { ...filters, ...overrides };
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== "" && value !== "all") params.set(key, String(value)); });
  return params.toString();
}
