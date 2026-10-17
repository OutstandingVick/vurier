export function NotificationsList({
  items,
}: {
  items: Array<{
    id: string;
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
  }>;
}) {
  if (!items.length) return null;
  return (
    <section
      className="rounded-2xl border bg-surface p-5"
      aria-labelledby="notification-heading"
    >
      <h2 id="notification-heading" className="font-semibold">
        Notifications
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li className="rounded-xl bg-surface-muted p-3" key={item.id}>
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
