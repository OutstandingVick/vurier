export default function LoadingMonitoring() {
  return (
    <div
      className="space-y-6 p-4 sm:p-6 lg:p-8"
      aria-label="Loading monitoring"
    >
      <div className="h-24 animate-pulse rounded-2xl bg-subtle" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-subtle"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-subtle" />
    </div>
  );
}
