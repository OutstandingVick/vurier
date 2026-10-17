import type { ApplicationState } from "@/core/applications/types";
import { ApplicationStatusBadge } from "@/components/applications/status-badge";
export function ApplicationTimeline({
  history,
}: {
  history: Array<{
    id: string;
    to_status: ApplicationState;
    source: string;
    note: string | null;
    created_at: string;
  }>;
}) {
  return (
    <section className="rounded-2xl border bg-surface p-5">
      <h2 className="font-semibold">Timeline</h2>
      {history.length ? (
        <ol className="mt-4 space-y-4 border-s ps-5">
          {history.map((item) => (
            <li className="relative" key={item.id}>
              <span className="absolute -start-[1.65rem] top-1 size-3 rounded-full border-2 border-surface bg-accent-strong" />
              <ApplicationStatusBadge status={item.to_status} />
              <p className="mt-1 text-xs text-muted">
                {item.source === "manual"
                  ? "Manually verified"
                  : item.source === "upwork_api"
                    ? "Upwork API"
                    : "Vurier workflow"}{" "}
                ·{" "}
                <time dateTime={item.created_at}>
                  {new Date(item.created_at).toLocaleString()}
                </time>
              </p>
              {item.note ? <p className="mt-1 text-sm">{item.note}</p> : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-sm text-muted">
          No status changes recorded yet.
        </p>
      )}
    </section>
  );
}
