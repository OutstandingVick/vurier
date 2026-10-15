import type { ZodType } from "zod";

export const DEEPSEEK_MODELS = ["deepseek-flash", "deepseek-v4-pro"] as const;
export type DeepSeekModel = (typeof DEEPSEEK_MODELS)[number];
export type ReasoningEffort = "low" | "medium" | "high";

export type AiMessage = { role: "system" | "user" | "assistant"; content: string };

export type AiRequest<T> = {
  messages: AiMessage[];
  model?: DeepSeekModel;
  reasoning?: ReasoningEffort;
  schema?: ZodType<T>;
  temperature?: number;
  signal?: AbortSignal;
};

export type TokenUsage = { inputTokens: number; outputTokens: number; totalTokens: number };
export type AiResult<T> = { data: T; model: DeepSeekModel; usage: TokenUsage; requestId?: string };
