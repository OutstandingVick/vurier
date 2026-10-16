export type UsageSnapshot = { analyses: number; estimatedCostUsd: number };
export type UsageLimits = { dailyAnalyses: number; monthlyCostUsd: number };
export function assertWithinUsageLimits(usage: UsageSnapshot, limits: UsageLimits) { if (usage.analyses >= limits.dailyAnalyses) throw new Error("Daily analysis limit reached. Adjust the limit in Settings or try again tomorrow."); if (usage.estimatedCostUsd >= limits.monthlyCostUsd) throw new Error("Monthly AI spending limit reached. Adjust the limit in Settings before continuing."); }
