import { describe, expect, it } from "vitest";
import { formatBudget, formatRelativeTime } from "@/core/jobs/format";

describe("job formatting", () => {
  it("formats fixed and hourly budgets", () => {
    expect(formatBudget({ job_type: "fixed", budget_min: 500, budget_max: 1000, hourly_min: null, hourly_max: null })).toBe("$500–$1,000");
    expect(formatBudget({ job_type: "hourly", budget_min: null, budget_max: null, hourly_min: 40, hourly_max: 60 })).toBe("$40–$60/hr");
  });
  it("does not invent unavailable values", () => {
    expect(formatBudget({ job_type: "unknown", budget_min: null, budget_max: null, hourly_min: null, hourly_max: null })).toBe("Budget unavailable");
    expect(formatRelativeTime(null)).toBe("Posting time unavailable");
  });
});
