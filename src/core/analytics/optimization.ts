export type FeedbackSignal = {
  factor: string;
  recommended: boolean;
  outcome: "hired" | "interview" | "rejected" | "no_response";
};
const EFFECT = {
  hired: 2,
  interview: 1,
  rejected: -1,
  no_response: -0.5,
} as const;
export function boundedAdjustments(
  signals: FeedbackSignal[],
  enabled: boolean,
  maxAdjustment = 5,
) {
  if (!enabled) return [];
  const groups = new Map<string, number[]>();
  for (const signal of signals)
    groups.set(signal.factor, [
      ...(groups.get(signal.factor) ?? []),
      EFFECT[signal.outcome] * (signal.recommended ? 1 : 0.5),
    ]);
  return [...groups.entries()]
    .map(([factor, values]) => ({
      factor,
      adjustment: Math.max(
        -maxAdjustment,
        Math.min(
          maxAdjustment,
          Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) /
            10,
        ),
      ),
      sampleSize: values.length,
      explanation: `Based on ${values.length} recorded outcome${values.length === 1 ? "" : "s"}; bounded to ±${maxAdjustment} points.`,
    }))
    .filter((item) => item.sampleSize >= 3);
}
export function applyBoundedScore(
  base: number,
  adjustments: Array<{ adjustment: number }>,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        base + adjustments.reduce((sum, item) => sum + item.adjustment, 0),
      ),
    ),
  );
}
