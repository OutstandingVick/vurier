"use client";
import { useActionState } from "react";
import { LoaderCircle, PackageCheck } from "lucide-react";
import { prepareApplication } from "@/app/dashboard/applications/actions";
export function PrepareApplicationForm({ proposalId }: { proposalId: string }) {
  const [state, action, pending] = useActionState(prepareApplication, {});
  return (
    <form
      action={action}
      className="rounded-2xl border border-accent-strong/30 bg-accent/10 p-5"
    >
      <input type="hidden" name="proposalId" value={proposalId} />
      <h2 className="font-semibold">Prepare application package</h2>
      <p className="mt-1 text-sm text-muted">
        Enter the Connects shown by Upwork. These values will be locked into the
        reviewed version.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Application Connects
          <input
            className="field"
            name="connectsCost"
            type="number"
            min="0"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Boost Connects{" "}
          <span className="font-normal text-muted">(optional)</span>
          <input
            className="field"
            name="boostConnects"
            type="number"
            min="0"
            defaultValue="0"
          />
        </label>
      </div>
      {state.error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="mt-3 text-sm" role="status">
          {state.message}
        </p>
      ) : null}
      <button className="button-primary mt-4" disabled={pending} type="submit">
        {pending ? (
          <LoaderCircle
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <PackageCheck className="size-4" aria-hidden="true" />
        )}
        {pending ? "Preparing…" : "Prepare application"}
      </button>
    </form>
  );
}
