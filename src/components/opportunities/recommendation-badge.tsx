import type { Recommendation } from "@/core/opportunities/types";
const labels = { apply: "Apply", consider: "Consider", skip: "Skip" };
export function RecommendationBadge({ recommendation }: { recommendation: Recommendation }) { return <span className="inline-flex rounded-full border bg-surface-muted px-2.5 py-1 text-xs font-semibold capitalize">{labels[recommendation]}</span>; }
