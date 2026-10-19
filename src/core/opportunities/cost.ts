import type { DeepSeekModel, TokenUsage } from "@/lib/ai/types";
export type ModelPrice = { inputPerMillion: number; outputPerMillion: number };
export const DEFAULT_MODEL_PRICES: Record<DeepSeekModel, ModelPrice> = {
  "deepseek-flash": { inputPerMillion: 0.1, outputPerMillion: 0.2 },
  "deepseek-v4-pro": { inputPerMillion: 0.5, outputPerMillion: 1.5 },
};
export function estimateCostUsd(
  model: DeepSeekModel,
  usage: TokenUsage,
  prices = DEFAULT_MODEL_PRICES,
) {
  return Number(
    (
      (usage.inputTokens * prices[model].inputPerMillion +
        usage.outputTokens * prices[model].outputPerMillion) /
      1_000_000
    ).toFixed(6),
  );
}
