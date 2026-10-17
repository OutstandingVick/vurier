import { createHash } from "node:crypto";
export function submissionIdempotencyKey(
  userId: string,
  applicationId: string,
  version: number,
) {
  return createHash("sha256")
    .update(`${userId}:${applicationId}:${version}`)
    .digest("hex");
}
