import { estimateCostUsd } from "@/core/opportunities/cost";
import type { TokenUsage } from "@/lib/ai/types";
export function proposalCost(strategy: TokenUsage, draft: TokenUsage) {
  return (
    estimateCostUsd("deepseek-v4-pro", strategy) +
    estimateCostUsd("deepseek-flash", draft)
  );
}
