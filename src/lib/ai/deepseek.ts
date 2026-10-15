import { getServerEnv } from "@/lib/env";
import { AiClientError } from "@/lib/ai/errors";
import type { AiRequest, AiResult, DeepSeekModel } from "@/lib/ai/types";

type DeepSeekResponse = {
  id?: string;
  model?: string;
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  error?: { message?: string };
};

export class DeepSeekClient {
  constructor(private readonly fetcher: typeof fetch = fetch) {}

  async generate<T = string>(request: AiRequest<T>): Promise<AiResult<T>> {
    const env = getServerEnv();
    const model: DeepSeekModel = request.model ?? "deepseek-flash";
    let response: Response;

    try {
      response = await this.fetcher(`${env.DEEPSEEK_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: request.messages,
          temperature: request.temperature ?? 0.2,
          reasoning_effort: request.reasoning ?? "medium",
          ...(request.schema ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: request.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw new AiClientError("Unable to reach the AI provider.", undefined, true);
    }

    const payload = (await response.json().catch(() => ({}))) as DeepSeekResponse;
    if (!response.ok) {
      throw new AiClientError(payload.error?.message ?? "The AI provider rejected the request.", response.status, response.status === 429 || response.status >= 500);
    }

    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new AiClientError("The AI provider returned an empty response.", response.status, true);

    let data: T;
    if (request.schema) {
      try {
        data = request.schema.parse(JSON.parse(content));
      } catch {
        throw new AiClientError("The AI response did not match the required structure.", response.status, true);
      }
    } else {
      data = content as T;
    }

    const inputTokens = payload.usage?.prompt_tokens ?? 0;
    const outputTokens = payload.usage?.completion_tokens ?? 0;
    return { data, model, requestId: payload.id, usage: { inputTokens, outputTokens, totalTokens: payload.usage?.total_tokens ?? inputTokens + outputTokens } };
  }
}

export const deepSeek = new DeepSeekClient();
