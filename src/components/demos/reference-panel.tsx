"use client";
import { useActionState } from "react";
import { ExternalLink } from "lucide-react";
import { addDemoReference } from "@/app/dashboard/demos/actions";
export function ReferencePanel({
  strategyId,
  references,
}: {
  strategyId: string;
  references: Array<Record<string, unknown>>;
}) {
  const [state, action, pending] = useActionState(addDemoReference, {});
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card">
      <h2 className="text-lg font-semibold">Verified references</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        Add public products or documentation you researched. Vurier verifies
        that each HTTPS URL resolves successfully; AI-generated URLs are not
        accepted.
      </p>
      {references.length ? (
        <ul className="mt-4 space-y-3">
          {references.map((reference) => (
            <li className="rounded-xl border p-4" key={String(reference.id)}>
              <a
                className="inline-flex items-center gap-2 font-medium text-accent underline decoration-from-font"
                href={String(reference.url)}
                target="_blank"
                rel="noreferrer"
              >
                {String(reference.title)}
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
              <p className="mt-2 text-sm leading-6 text-muted">
                {String(reference.relevance)}
              </p>
              <p className="mt-2 text-xs text-muted">
                Verified{" "}
                {new Date(String(reference.verified_at)).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">
          No verified references saved. The strategy does not claim any.
        </p>
      )}
      <form action={action} className="mt-6 grid gap-4">
        <input type="hidden" name="strategyId" value={strategyId} />
        <label className="space-y-2 text-sm font-medium">
          Reference title
          <input className="field" name="title" required maxLength={200} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Public HTTPS URL
          <input
            className="field"
            type="url"
            name="url"
            required
            placeholder="https://docs.example.com/product"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Why it is relevant
          <textarea
            className="field min-h-24"
            name="relevance"
            required
            maxLength={1000}
          />
        </label>
        <button
          className="button-secondary w-fit"
          disabled={pending}
          type="submit"
        >
          {pending ? "Verifying…" : "Verify and save reference"}
        </button>
        <div role="status" aria-live="polite">
          {state.error ? (
            <p className="text-sm text-danger">{state.error}</p>
          ) : null}
          {state.message ? (
            <p className="text-sm text-success">{state.message}</p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
