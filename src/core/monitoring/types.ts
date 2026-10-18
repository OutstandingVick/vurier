export const MONITOR_INTERVALS = ["15m", "30m", "hourly", "daily"] as const;
export type MonitorInterval = (typeof MONITOR_INTERVALS)[number];
export type MonitoringConfig = {
  enabled: boolean;
  interval: MonitorInterval;
  timezone: string;
  categories: string[];
  scoreThreshold: number;
  quietStart: string | null;
  quietEnd: string | null;
  inAppEnabled: boolean;
  telegramEnabled: boolean;
  maxJobsPerRun: number;
  dailyNotificationLimit: number;
};
export type MonitoringStats = {
  discovered: number;
  analyzed: number;
  notified: number;
  failed: number;
  cached: number;
  estimatedCostUsd: number;
};
