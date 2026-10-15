import type { ProposalRange } from "@/core/jobs/types";

export const proposalLabels: Record<ProposalRange, string> = {
  less_than_5: "Fewer than 5 proposals", "5_to_10": "5–10 proposals", "10_to_15": "10–15 proposals", "15_to_20": "15–20 proposals", "20_to_50": "20–50 proposals", "50_plus": "50+ proposals", unknown: "Proposal count unavailable",
};

export function formatMoney(value: number | null, currency = "USD") {
  if (value === null) return null;
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function formatBudget(job: { job_type: string; budget_min: number | null; budget_max: number | null; hourly_min: number | null; hourly_max: number | null; currency?: string | null }) {
  const currency = job.currency ?? "USD";
  const min = job.job_type === "hourly" ? job.hourly_min : job.budget_min;
  const max = job.job_type === "hourly" ? job.hourly_max : job.budget_max;
  if (min === null && max === null) return "Budget unavailable";
  const amount = min !== null && max !== null && min !== max ? `${formatMoney(min, currency)}–${formatMoney(max, currency)}` : formatMoney(max ?? min, currency);
  return job.job_type === "hourly" ? `${amount}/hr` : amount ?? "Budget unavailable";
}

export function formatRelativeTime(value: string | null, now = Date.now()) {
  if (!value) return "Posting time unavailable";
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Posting time unavailable";
  const seconds = Math.round((timestamp - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(seconds) < 3600) return formatter.format(Math.round(seconds / 60), "minute");
  if (Math.abs(seconds) < 86400) return formatter.format(Math.round(seconds / 3600), "hour");
  return formatter.format(Math.round(seconds / 86400), "day");
}
