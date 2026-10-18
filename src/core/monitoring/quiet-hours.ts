function localMinutes(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );
  return hour * 60 + minute;
}

function parseTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function isQuietTime(input: {
  now?: Date;
  timezone: string;
  start: string | null;
  end: string | null;
}) {
  if (!input.start || !input.end || input.start === input.end) return false;
  const now = localMinutes(input.now ?? new Date(), input.timezone);
  const start = parseTime(input.start);
  const end = parseTime(input.end);
  return start < end ? now >= start && now < end : now >= start || now < end;
}
