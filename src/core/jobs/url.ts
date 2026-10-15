import { createHash } from "node:crypto";

export function normalizeUpworkJobUrl(input: string) {
  const url = new URL(input);
  url.hash = "";
  url.search = "";
  url.hostname = url.hostname.toLowerCase();
  url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

export function manualExternalId(url: string) {
  return `manual_${createHash("sha256").update(normalizeUpworkJobUrl(url)).digest("hex").slice(0, 32)}`;
}
