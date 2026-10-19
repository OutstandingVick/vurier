import { describe, expect, it } from "vitest";
import { decryptToken, encryptToken } from "@/lib/crypto/token-vault";

describe("token vault", () => {
  it("encrypts and authenticates integration tokens", () => {
    const key = Buffer.alloc(32, 7).toString("base64");
    const encrypted = encryptToken("provider-secret", key);
    expect(encrypted).not.toContain("provider-secret");
    expect(decryptToken(encrypted, key)).toBe("provider-secret");
  });
  it("rejects invalid key lengths", () => {
    expect(() =>
      encryptToken("secret", Buffer.alloc(16).toString("base64")),
    ).toThrow("32 bytes");
  });
  it("binds versioned ciphertext to its user and provider context", () => {
    const key = Buffer.alloc(32, 9).toString("base64");
    const encrypted = encryptToken("token", key, "user-a:upwork:access");
    expect(() =>
      decryptToken(encrypted, key, "user-b:upwork:access"),
    ).toThrow();
  });
});
