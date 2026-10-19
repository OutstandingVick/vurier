export default function LoadingDemos() {
  return (
    <div
      className="space-y-5 p-4 sm:p-6 lg:p-8"
      aria-label="Loading demo intelligence"
    >
      <div className="h-24 animate-pulse rounded-2xl bg-subtle" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-56 animate-pulse rounded-2xl bg-subtle"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
