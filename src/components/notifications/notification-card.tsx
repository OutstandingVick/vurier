import Link from "next/link";
import { Check, X } from "lucide-react";
import {
  dismissNotification,
  markNotificationRead,
} from "@/app/dashboard/notifications/actions";

export function NotificationCard({ item }: { item: Record<string, unknown> }) {
  return (
    <article className="rounded-2xl bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{String(item.title)}</h2>
            {!item.read_at ? (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
                Unread
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            {String(item.message)}
          </p>
          <p className="mt-3 text-xs text-muted">
            {new Date(String(item.created_at)).toLocaleString()}
          </p>
        </div>
        <form action={dismissNotification}>
          <input type="hidden" name="notificationId" value={String(item.id)} />
          <button
            className="grid size-10 place-items-center rounded-xl border"
            type="submit"
            aria-label="Dismiss notification"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {item.action_url ? (
          <Link className="button-secondary" href={String(item.action_url)}>
            Review opportunity
          </Link>
        ) : null}
        {!item.read_at ? (
          <form action={markNotificationRead}>
            <input
              type="hidden"
              name="notificationId"
              value={String(item.id)}
            />
            <button className="button-secondary" type="submit">
              <Check className="size-4" aria-hidden="true" />
              Mark as read
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
