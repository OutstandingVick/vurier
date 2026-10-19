import { CircleAlert, Lightbulb } from "lucide-react";

export function StrategyReasoning({
  rationale,
  risks,
}: {
  rationale: string[];
  risks: string[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ReasonList
        icon={Lightbulb}
        title="Why this approach"
        items={rationale}
        empty="No evidence-based rationale was returned."
      />
      <ReasonList
        icon={CircleAlert}
        title="Risks to review"
        items={risks}
        empty="No specific risks were identified from available data."
      />
    </div>
  );
}

function ReasonList({
  icon: Icon,
  title,
  items,
  empty,
}: {
  icon: typeof Lightbulb;
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <section className="rounded-2xl border bg-surface p-5">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon className="size-4" aria-hidden="true" />
        {title}
      </h2>
      {items.length ? (
        <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-6 text-muted">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">{empty}</p>
      )}
    </section>
  );
}
