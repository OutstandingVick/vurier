"use client";
export default function MonitoringError({ reset }: { reset: () => void }) {
  return (
    <div className="m-4 rounded-2xl border bg-surface p-6 sm:m-6 lg:m-8">
      <h1 className="text-lg font-semibold">Unable to load monitoring</h1>
      <p className="mt-2 text-sm text-muted">
        Check the database migration and connection, then try again.
      </p>
      <button className="button-secondary mt-4" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
