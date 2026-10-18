import type { MonitorInterval } from "@/core/monitoring/types";

const intervalCron: Record<MonitorInterval, string> = {
  "15m": "*/15 * * * *",
  "30m": "*/30 * * * *",
  hourly: "0 * * * *",
  daily: "0 8 * * *",
};

export function cronForInterval(interval: MonitorInterval) {
  return intervalCron[interval];
}

export function nextRunAt(interval: MonitorInterval, from = new Date()) {
  const minutes =
    interval === "15m"
      ? 15
      : interval === "30m"
        ? 30
        : interval === "hourly"
          ? 60
          : 1_440;
  return new Date(from.getTime() + minutes * 60_000);
}
