"use client";
export default function NotificationsError({ reset }: { reset: () => void }) {
  return (
    <div className="m-4 rounded-2xl border bg-surface p-6 sm:m-6 lg:m-8">
      <h1 className="text-lg font-semibold">Unable to load notifications</h1>
      <p className="mt-2 text-sm text-muted">
        Check your connection and try again.
      </p>
      <button className="button-secondary mt-4" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
