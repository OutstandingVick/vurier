import { Bell } from "lucide-react";
import { markAllNotificationsRead } from "./actions";
import { NotificationCard } from "@/components/notifications/notification-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

export const instant = false;
export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  let notifications: Array<Record<string, unknown>> = [];
  if (hasSupabaseEnv()) {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    let query = client
      .from("notifications")
      .select("*")
      .eq("user_id", user?.id ?? "")
      .is("dismissed_at", null)
      .order("created_at", { ascending: false });
    if (filter === "unread") query = query.is("read_at", null);
    if (filter === "opportunity") query = query.eq("category", "opportunity");
    const { data } = await query.limit(100);
    notifications = data ?? [];
  }
  return (
    <PageShell
      title="Notifications"
      description="Opportunity alerts and workflow updates"
    >
      <div className="space-y-6">
        <section className="grid gap-4 rounded-2xl bg-surface p-4 shadow-card lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <form className="grid gap-3 sm:grid-cols-[minmax(0,18rem)_auto] sm:items-end">
            <label className="space-y-2 text-sm font-medium">
              Show
              <select
                className="field min-w-48"
                name="filter"
                defaultValue={filter}
              >
                <option value="all">All notifications</option>
                <option value="unread">Unread</option>
                <option value="opportunity">Opportunities</option>
              </select>
            </label>
            <button className="button-secondary" type="submit">
              Apply filter
            </button>
          </form>
          <form className="w-fit" action={markAllNotificationsRead}>
            <button className="button-secondary" type="submit">
              Mark all as read
            </button>
          </form>
        </section>
        {notifications.length ? (
          <section className="space-y-4" aria-label="Notification center">
            {notifications.map((item) => (
              <NotificationCard key={String(item.id)} item={item} />
            ))}
          </section>
        ) : (
          <EmptyState
            icon={Bell}
            title="No notifications here"
            description={
              filter === "all"
                ? "High-fit opportunities and workflow updates will appear here."
                : "No notifications match this filter. Select All notifications to see everything."
            }
          />
        )}
      </div>
    </PageShell>
  );
}
