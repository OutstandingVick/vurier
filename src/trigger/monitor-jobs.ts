import { schedules } from "@trigger.dev/sdk";
import { monitoringRunKey } from "@/core/monitoring/idempotency";
import { runMonitoring } from "@/core/monitoring/runner";

export const monitorJobs = schedules.task({
  id: "vurier-monitor-jobs",
  maxDuration: 300,
  concurrency: { perKey: 1, total: 10 },
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1_000,
    maxTimeoutInMs: 30_000,
    factor: 2,
  },
  run: async (payload, { ctx }) => {
    if (!payload.externalId || !payload.scheduleId)
      throw new Error("A user-bound Trigger schedule is required.");
    return runMonitoring({
      userId: payload.externalId,
      scheduleId: payload.scheduleId,
      idempotencyKey: monitoringRunKey(payload.scheduleId, payload.timestamp),
      triggerRunId: ctx.run.id,
    });
  },
});
