export function EvidenceList({
  evidence,
}: {
  evidence: Array<Record<string, unknown>>;
}) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card">
      <h2 className="font-semibold">Matched verified evidence</h2>
      {evidence.length ? (
        <ul className="mt-4 space-y-3">
          {evidence.map((item) => (
            <li className="rounded-xl border p-4" key={String(item.id)}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{String(item.title)}</p>
                <span className="text-sm font-semibold tabular-nums">
                  {String(item.relevance)}%
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">
                {Array.isArray(item.reasons)
                  ? item.reasons.join(" · ")
                  : "Selected as verified evidence"}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">
          No verified portfolio evidence matched. The strategy must not claim
          prior work.
        </p>
      )}
    </section>
  );
}
