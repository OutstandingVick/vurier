import type { DateWindow } from "./types";

const DAYS = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 } as const;
export function resolveDateWindow(
  value: string | undefined,
  now = new Date(),
): DateWindow {
  const key = value && value in DAYS ? (value as keyof typeof DAYS) : "30d";
  const duration = DAYS[key] * 86_400_000;
  const to = new Date(now);
  const from = new Date(to.getTime() - duration);
  return {
    key,
    from,
    to,
    previousFrom: new Date(from.getTime() - duration),
    previousTo: from,
  };
}
export function inWindow(
  value: string | null | undefined,
  from: Date,
  to: Date,
) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return (
    Number.isFinite(timestamp) &&
    timestamp >= from.getTime() &&
    timestamp < to.getTime()
  );
}
export function comparison(current: number, previous: number) {
  return {
    value: current,
    previous,
    changePercent:
      previous === 0
        ? current === 0
          ? 0
          : null
        : Math.round(((current - previous) / previous) * 1000) / 10,
  };
}
