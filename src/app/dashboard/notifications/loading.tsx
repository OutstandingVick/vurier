export default function LoadingNotifications() {
  return (
    <div
      className="space-y-4 p-4 sm:p-6 lg:p-8"
      aria-label="Loading notifications"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-36 animate-pulse rounded-2xl bg-subtle" />
      ))}
    </div>
  );
}
