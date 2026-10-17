import { updateManualStatus } from "@/app/dashboard/applications/actions";
export function StatusControls({ applicationId }: { applicationId: string }) {
  return (
    <form
      action={updateManualStatus}
      className="rounded-2xl border bg-surface p-5"
    >
      <h2 className="font-semibold">Manual status update</h2>
      <p className="mt-1 text-sm text-muted">
        Use this only when you verified the status directly on Upwork.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="space-y-2 text-sm font-medium">
          Verified status
          <select className="field min-w-48" name="status">
            <option value="submitted">Submitted manually</option>
            <option value="viewed">Viewed</option>
            <option value="interviewing">Interviewing</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </label>
        <input type="hidden" name="applicationId" value={applicationId} />
        <button className="button-secondary" type="submit">
          Save verified status
        </button>
      </div>
    </form>
  );
}
