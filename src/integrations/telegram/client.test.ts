import { describe, expect, it, vi } from "vitest";
import { TelegramClient } from "./client";

const alert = {
  title: "Frontend job",
  budget: "$500",
  score: 88,
  insights: ["Good fit"],
  vurierUrl: "https://vurier.test",
  upworkUrl: null,
};
describe("TelegramClient", () => {
  it("returns a confirmed message id", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: { message_id: 42 } }), {
        status: 200,
      }),
    );
    await expect(
      new TelegramClient(fetcher).sendAlert("secret", "chat", alert),
    ).resolves.toEqual({ messageId: "42" });
  });
  it("marks rate limits retryable without exposing the token", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ ok: false, description: "Too Many Requests" }),
          { status: 429 },
        ),
      );
    await expect(
      new TelegramClient(fetcher).sendAlert("secret", "chat", alert),
    ).rejects.toMatchObject({ retryable: true, status: 429 });
  });
});
