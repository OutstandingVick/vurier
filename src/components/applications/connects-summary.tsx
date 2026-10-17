import type { UpworkConnectsSummary } from "@/integrations/upwork/client";

export function ConnectsSummary({
  summary,
  message,
}: {
  summary: UpworkConnectsSummary | null;
  message: string;
}) {
  return (
    <section className="rounded-2xl border bg-surface p-5" aria-live="polite">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Upwork Connects
      </p>
      {summary ? (
        <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-2">
          <p className="text-3xl font-semibold tabular-nums">
            {summary.connectsBalance ?? "Unavailable"}
          </p>
          <p className="text-sm text-muted">
            Free {summary.connectsBalanceFree ?? "—"} · Paid{" "}
            {summary.connectsBalancePaid ?? "—"}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">{message}</p>
      )}
    </section>
  );
}
