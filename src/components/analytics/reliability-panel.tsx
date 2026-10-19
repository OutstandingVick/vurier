import { Activity, CircleAlert, CircleCheck, CircleHelp } from "lucide-react";
import type { ReliabilitySummary } from "@/core/analytics";
import { refreshIntegrationHealth } from "@/app/dashboard/analytics/health-action";
export function ReliabilityPanel({
  reliability,
}: {
  reliability: ReliabilitySummary;
}) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Activity className="size-4" aria-hidden="true" />
          System reliability
        </h2>
        <form action={refreshIntegrationHealth}>
          <button className="button-ghost" type="submit">
            Refresh status
          </button>
        </form>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat
          label="Run success"
          value={
            reliability.monitoringSuccessRate === null
              ? "—"
              : `${reliability.monitoringSuccessRate}%`
          }
        />
        <Stat label="Failed runs" value={String(reliability.failedRuns)} />
        <Stat
          label="Unresolved submissions"
          value={String(reliability.unresolvedSubmissionAttempts)}
        />
      </div>
      <ul className="mt-5 space-y-3">
        {reliability.integrations.length ? (
          reliability.integrations.map((item) => {
            const Icon =
              item.status === "connected"
                ? CircleCheck
                : item.status === "error"
                  ? CircleAlert
                  : CircleHelp;
            return (
              <li
                className="flex items-start gap-3 rounded-xl border p-3"
                key={item.name}
              >
                <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium capitalize">
                    {item.name} · {item.status}
                  </p>
                  <p className="mt-1 text-xs text-muted">{item.detail}</p>
                </div>
              </li>
            );
          })
        ) : (
          <li className="text-sm text-muted">
            No production health checks have reported yet.
          </li>
        )}
      </ul>
    </section>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-muted p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{value}</p>
    </div>
  );
}
