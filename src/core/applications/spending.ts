import type { ConnectsUsage, SpendingLimits } from "@/core/applications/types";
export function assertSpendingAllowed(
  cost: number | null,
  boost: number,
  usage: ConnectsUsage,
  limits: SpendingLimits,
) {
  if (cost === null)
    throw new Error(
      "Connects cost is unavailable. Enter the verified cost before approval.",
    );
  const total = cost + boost;
  if (total < 0) throw new Error("Connects cost cannot be negative.");
  if (usage.daily + total > limits.daily)
    throw new Error("Daily Connects limit would be exceeded.");
  if (usage.monthly + total > limits.monthly)
    throw new Error("Monthly Connects limit would be exceeded.");
  if (usage.available !== null && total > usage.available)
    throw new Error("Available Connects balance is insufficient.");
  return {
    total,
    estimatedRemaining:
      usage.available === null ? null : usage.available - total,
  };
}
