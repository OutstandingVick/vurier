"use client";
import { useActionState } from "react";
import { saveDemoAsset } from "@/app/dashboard/demos/actions";
export function AssetPanel({
  strategyId,
  assets,
}: {
  strategyId: string;
  assets: Array<Record<string, unknown>>;
}) {
  const [state, action, pending] = useActionState(saveDemoAsset, {});
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card">
      <h2 className="text-lg font-semibold">Proof-of-work assets</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        Track progress here. Only completed work you explicitly verify can be
        attached to a proposal.
      </p>
      {assets.length ? (
        <ul className="mt-4 space-y-3">
          {assets.map((asset) => (
            <li className="rounded-xl border p-4" key={String(asset.id)}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{String(asset.title)}</p>
                <span className="rounded-full bg-subtle px-2 py-1 text-xs font-semibold capitalize">
                  {String(asset.status).replaceAll("_", " ")}
                  {asset.verified ? " · Verified" : ""}
                </span>
              </div>
              {asset.url ? (
                <a
                  className="mt-2 inline-block text-sm text-accent underline"
                  href={String(asset.url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open completed asset
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <form
        action={action}
        className="mt-6 grid gap-4"
        encType="multipart/form-data"
      >
        <input type="hidden" name="strategyId" value={strategyId} />
        <label className="space-y-2 text-sm font-medium">
          Asset title
          <input className="field" name="title" required maxLength={200} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Progress
            <select className="field" name="status">
              <option value="draft">Draft</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Completed URL
            <input
              className="field"
              type="url"
              name="url"
              placeholder="https://demo.example.com"
            />
          </label>
        </div>
        <label className="space-y-2 text-sm font-medium">
          Completed file
          <input
            className="field"
            type="file"
            name="file"
            accept=".pdf,.docx,.txt,.zip,.png,.jpg,.jpeg"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Progress notes
          <textarea className="field min-h-24" name="notes" maxLength={3000} />
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-xl border px-4 text-sm font-medium">
          <input type="checkbox" name="verified" />I reviewed this completed
          asset and approve it for proposal attachment
        </label>
        <button
          className="button-primary w-fit"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving…" : "Save asset"}
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
