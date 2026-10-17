import { createHash } from "node:crypto";
import type { ApplicationPackage } from "@/core/applications/types";
export function applicationFingerprint(value: ApplicationPackage) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
