import { associationNote, type StrategyDimension } from "@/core/analytics";
export function StrategyTable({
  title,
  rows,
}: {
  title: string;
  rows: StrategyDimension[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-surface shadow-card">
      <div className="p-5">
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">
          Associations only; results do not establish causation.
        </p>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="border-y bg-surface-muted text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3">Strategy</th>
                <th className="px-4 py-3">Applications</th>
                <th className="px-4 py-3">Interview rate</th>
                <th className="px-4 py-3">Hire rate</th>
                <th className="px-4 py-3">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="px-5 py-4">
                    <p className="font-medium capitalize">
                      {row.label.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {associationNote(row.sampleSufficient)}
                    </p>
                  </td>
                  <td className="px-4 py-4 tabular-nums">{row.applications}</td>
                  <td className="px-4 py-4 tabular-nums">
                    {(row.interviewRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-4 tabular-nums">
                    {(row.hireRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-4 tabular-nums">
                    ${row.earnings.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="border-t p-5 text-sm text-muted">
          Record application outcomes to compare strategies.
        </p>
      )}
    </section>
  );
}
