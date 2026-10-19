import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { DeepSeekClient } from "@/lib/ai/deepseek";
import { AiClientError } from "@/lib/ai/errors";

afterEach(() => vi.unstubAllEnvs());

function configureEnv() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
  vi.stubEnv("DEEPSEEK_API_KEY", "secret");
  vi.stubEnv("DEEPSEEK_BASE_URL", "https://api.deepseek.test");
}

describe("DeepSeekClient", () => {
  it("parses structured responses and reports token usage", async () => {
    configureEnv();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "req_1",
            choices: [{ message: { content: '{"score":91}' } }],
            usage: {
              prompt_tokens: 12,
              completion_tokens: 4,
              total_tokens: 16,
            },
          }),
          { status: 200 },
        ),
      );
    const result = await new DeepSeekClient(fetcher).generate({
      messages: [{ role: "user", content: "Score this" }],
      schema: z.object({ score: z.number() }),
    });
    expect(result.data.score).toBe(91);
    expect(result.usage.totalTokens).toBe(16);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("marks rate limits as retryable", async () => {
    configureEnv();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "Slow down" } }), {
          status: 429,
        }),
      );
    await expect(
      new DeepSeekClient(fetcher).generate({
        messages: [{ role: "user", content: "Hello" }],
      }),
    ).rejects.toMatchObject({
      status: 429,
      retryable: true,
    } satisfies Partial<AiClientError>);
  });

  it("rejects malformed structured responses", async () => {
    configureEnv();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { content: "not json" } }] }),
          { status: 200 },
        ),
      );
    await expect(
      new DeepSeekClient(fetcher).generate({
        messages: [{ role: "user", content: "Hello" }],
        schema: z.object({ ok: z.boolean() }),
      }),
    ).rejects.toThrow("required structure");
  });
});
