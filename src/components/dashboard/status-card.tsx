import type { LucideIcon } from "lucide-react";

export function StatusCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-2xl bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] tabular-nums">
            {value}
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-surface-muted text-muted">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">{helper}</p>
    </article>
  );
}
