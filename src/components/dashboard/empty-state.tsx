import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed bg-surface/50 p-6 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface-muted text-muted">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-lg font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        <p className="mt-2 text-pretty text-sm leading-6 text-muted">
          {description}
        </p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}
