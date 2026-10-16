import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { QaResult } from "@/core/proposals/types";
export function QualityReport({ qa }: { qa: QaResult }) {
  return (
    <section
      className="rounded-2xl border bg-surface p-5"
      aria-labelledby="qa-heading"
    >
      <h2 id="qa-heading" className="flex items-center gap-2 font-semibold">
        {qa.passed ? (
          <CheckCircle2 className="size-4" aria-hidden="true" />
        ) : (
          <AlertTriangle className="size-4" aria-hidden="true" />
        )}
        Quality assurance
      </h2>
      <p className="mt-2 text-sm text-muted">
        {qa.passed
          ? "No unsupported claims or style issues detected."
          : "Review these flags before approval."}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        {Object.entries(qa.scores).map(([key, value]) => (
          <div className="rounded-xl bg-surface-muted p-3" key={key}>
            <dt className="capitalize text-muted">
              {key.replace(/([A-Z])/g, " $1")}
            </dt>
            <dd className="mt-1 font-semibold tabular-nums">{value}/100</dd>
          </div>
        ))}
      </dl>
      {qa.unsupportedClaims.length ? (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-danger">
            Unsupported claims
          </h3>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm">
            {qa.unsupportedClaims.map((claim) => (
              <li key={claim}>{claim}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {qa.warnings.length ? (
        <ul className="mt-4 list-disc space-y-1 ps-5 text-sm">
          {qa.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
