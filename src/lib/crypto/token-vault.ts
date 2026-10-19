import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function getKey(base64Key: string) {
  const key = Buffer.from(base64Key, "base64");
  if (key.length !== 32)
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY must decode to exactly 32 bytes.",
    );
  return key;
}

export function encryptToken(
  value: string,
  base64Key: string,
  context = "legacy",
) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(base64Key), iv);
  cipher.setAAD(Buffer.from(context, "utf8"));
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return ["v1", iv, tag, encrypted]
    .map((part) =>
      typeof part === "string" ? part : part.toString("base64url"),
    )
    .join(".");
}

export function decryptToken(
  value: string,
  base64Key: string,
  context = "legacy",
) {
  const parts = value.split(".");
  const versioned = parts[0] === "v1";
  const [ivPart, tagPart, encryptedPart] = versioned ? parts.slice(1) : parts;
  if (!ivPart || !tagPart || !encryptedPart)
    throw new Error("Encrypted token format is invalid.");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(base64Key),
    Buffer.from(ivPart, "base64url"),
  );
  if (versioned) decipher.setAAD(Buffer.from(context, "utf8"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
