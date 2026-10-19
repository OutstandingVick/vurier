import type { TokenUsage } from "@/lib/ai/types";
import { estimateCostUsd } from "@/core/opportunities/cost";

export function demoGenerationCost(strategy: TokenUsage, brief: TokenUsage) {
  return (
    estimateCostUsd("deepseek-v4-pro", strategy) +
    estimateCostUsd("deepseek-flash", brief)
  );
}
