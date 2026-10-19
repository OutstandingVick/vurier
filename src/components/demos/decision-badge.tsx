import type { DemoDecision } from "@/core/demos/types";
const labels: Record<DemoDecision, string> = {
  build: "Build",
  reuse: "Reuse",
  skip: "Skip",
};
export function DecisionBadge({ decision }: { decision: DemoDecision }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${decision === "build" ? "bg-success-soft text-success" : decision === "reuse" ? "bg-accent-soft text-accent" : "bg-subtle text-muted"}`}
    >
      {labels[decision]}
    </span>
  );
}
