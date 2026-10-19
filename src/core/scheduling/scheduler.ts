export type ScheduledTask = {
  key: string;
  runAt: Date;
  payload: Record<string, unknown>;
};

export interface BackgroundScheduler {
  schedule(task: ScheduledTask): Promise<{ scheduleId: string }>;
  cancel(scheduleId: string): Promise<void>;
}
