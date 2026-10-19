import { describe, expect, it } from "vitest";
import { integrationHealth } from "./health";
describe("integration health", () => {
  it("never calls an unavailable integration connected", () => {
    const result = integrationHealth({
      supabase: true,
      deepseek: false,
      upworkConfigured: false,
      upworkConnected: false,
      trigger: false,
      telegramConnected: false,
    });
    expect(result.find((item) => item.integration === "deepseek")?.status).toBe(
      "disabled",
    );
    expect(result.find((item) => item.integration === "supabase")?.status).toBe(
      "connected",
    );
  });
});
