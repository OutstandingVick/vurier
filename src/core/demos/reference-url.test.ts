import { describe, expect, it, vi } from "vitest";
import {
  validatePublicReferenceUrl,
  verifyReferenceUrl,
} from "./reference-url";

describe("reference URL validation", () => {
  it("rejects local and non-HTTPS references", async () => {
    await expect(
      validatePublicReferenceUrl("http://example.com"),
    ).rejects.toThrow(/HTTPS/);
    await expect(
      validatePublicReferenceUrl("https://localhost/test"),
    ).rejects.toThrow(/public/);
  });
  it("records only successful verification", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    await expect(
      verifyReferenceUrl("https://example.com/docs", fetcher),
    ).resolves.toMatchObject({ status: 200, url: "https://example.com/docs" });
  });
  it("surfaces failed references", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 404 }));
    await expect(
      verifyReferenceUrl("https://example.com/missing", fetcher),
    ).rejects.toThrow(/404/);
  });
});
