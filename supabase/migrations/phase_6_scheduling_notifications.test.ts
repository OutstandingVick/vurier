import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  new URL(
    "./20261020000000_phase_6_scheduling_notifications.sql",
    import.meta.url,
  ),
  "utf8",
);
describe("Phase 6 migration", () => {
  it("persists schedules runs deliveries and errors", () => {
    for (const table of [
      "monitoring_schedules",
      "notification_preferences",
      "monitoring_runs",
      "notification_deliveries",
      "monitoring_errors",
      "telegram_connections",
    ])
      expect(sql).toContain(`public.${table}`);
  });
  it("enforces run and delivery idempotency", () =>
    expect(sql.match(/idempotency_key text not null unique/g)).toHaveLength(2));
  it("enables RLS on every Phase 6 table", () =>
    expect(sql.match(/enable row level security/g)).toHaveLength(6));
  it("keeps encrypted Telegram credentials server-managed", () =>
    expect(sql).toContain(
      "revoke all on public.telegram_connections from anon, authenticated",
    ));
});
