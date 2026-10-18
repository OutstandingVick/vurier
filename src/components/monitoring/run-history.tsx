export function RunHistory({ runs }: { runs: Array<Record<string, unknown>> }) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold">Recent runs</h2>
      {runs.length ? (
        <div className="mt-4 divide-y">
          {runs.map((run) => (
            <article
              className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_auto]"
              key={String(run.id)}
            >
              <div>
                <p className="font-medium capitalize">{String(run.status)}</p>
                <p className="mt-1 text-muted">
                  {new Date(String(run.started_at)).toLocaleString()} ·{" "}
                  {String(run.jobs_discovered)} discovered ·{" "}
                  {String(run.opportunities_analyzed)} analyzed
                </p>
                {run.error_message ? (
                  <p className="mt-2 text-danger">
                    {String(run.error_message)}
                  </p>
                ) : null}
              </div>
              <p className="text-muted">
                {String(run.notifications_delivered)} alerts
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">
          No monitoring runs yet. Enable a schedule to begin authorized
          discovery.
        </p>
      )}
    </section>
  );
}
