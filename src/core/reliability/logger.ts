const SECRET_KEY = /token|secret|authorization|cookie|password|signature|key/i;
export function sanitizeMetadata(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SECRET_KEY.test(key)
        ? "[REDACTED]"
        : typeof item === "string" && item.length > 500
          ? `${item.slice(0, 500)}…`
          : item,
    ]),
  );
}
export function logEvent(
  level: "info" | "warning" | "error",
  event: string,
  metadata: Record<string, unknown> = {},
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitizeMetadata(metadata),
  };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warning") console.warn(JSON.stringify(entry));
  else console.info(JSON.stringify(entry));
}
