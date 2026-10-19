import { createHash } from "node:crypto";

export function demoFingerprint(input: unknown) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}
