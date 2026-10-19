import { attachDemoToProposal } from "@/app/dashboard/demos/proposal-actions";
export function ProposalAssets({
  proposalId,
  assets,
}: {
  proposalId: string;
  assets: Array<Record<string, unknown>>;
}) {
  if (!assets.length) return null;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card">
      <h2 className="font-semibold">Approved proof of work</h2>
      <p className="mt-1 text-sm text-muted">
        Attaching creates a new proposal version and invalidates any existing
        application approval.
      </p>
      <div className="mt-4 space-y-3">
        {assets.map((asset) => (
          <form
            action={attachDemoToProposal}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
            key={String(asset.id)}
          >
            <div>
              <p className="font-medium">{String(asset.title)}</p>
              <p className="mt-1 text-xs text-muted">
                Completed and user verified
              </p>
            </div>
            <input type="hidden" name="proposalId" value={proposalId} />
            <input type="hidden" name="assetId" value={String(asset.id)} />
            <button className="button-secondary" type="submit">
              Attach to proposal
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
