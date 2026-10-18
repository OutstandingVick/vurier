import { createHash } from "node:crypto";

export function monitoringRunKey(scheduleId: string, scheduledAt: Date) {
  return createHash("sha256")
    .update(`${scheduleId}:${scheduledAt.toISOString()}`)
    .digest("hex");
}
