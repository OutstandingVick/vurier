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
    const requester = vi.fn().mockResolvedValue(200);
    const resolver = vi.fn().mockResolvedValue([{ address: "93.184.216.34" }]);
    await expect(
      verifyReferenceUrl("https://example.com/docs", requester, resolver),
    ).resolves.toMatchObject({ status: 200, url: "https://example.com/docs" });
  });
  it("surfaces failed references", async () => {
    const requester = vi.fn().mockResolvedValue(404);
    const resolver = vi.fn().mockResolvedValue([{ address: "93.184.216.34" }]);
    await expect(
      verifyReferenceUrl("https://example.com/missing", requester, resolver),
    ).rejects.toThrow(/404/);
  });
  it("pins verification to the validated public address", async () => {
    const requester = vi.fn().mockResolvedValue(200);
    const resolver = vi.fn().mockResolvedValue([{ address: "93.184.216.34" }]);
    await verifyReferenceUrl("https://example.com", requester, resolver);
    expect(requester).toHaveBeenCalledWith(
      expect.any(URL),
      "93.184.216.34",
      "HEAD",
    );
  });
});
