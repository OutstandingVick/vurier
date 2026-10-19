import type { DemoBrief } from "@/core/demos/types";

export function BriefView({ brief }: { brief: DemoBrief }) {
  const groups = [
    ["Essential features", brief.essentialFeatures],
    ["Recommended technologies", brief.technologies],
    ["Scope boundaries", brief.scopeBoundaries],
    ["Deliverables", brief.deliverables],
    ["Acceptance criteria", brief.acceptanceCriteria],
  ] as const;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Actionable brief
          </p>
          <h2 className="mt-2 text-lg font-semibold">{brief.objective}</h2>
        </div>
        <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-muted">
          {brief.estimatedEffortHours === null
            ? "Effort unavailable"
            : `About ${brief.estimatedEffortHours} hours`}
        </span>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(([title, items]) => (
          <div key={title}>
            <h3 className="text-sm font-semibold">{title}</h3>
            <ul className="mt-2 list-disc space-y-1.5 ps-5 text-sm leading-6 text-muted">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
