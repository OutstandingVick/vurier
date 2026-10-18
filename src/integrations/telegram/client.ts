import { formatTelegramAlert } from "./format";
import type { TelegramAlert } from "./types";

export class TelegramError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status?: number,
  ) {
    super(message);
    this.name = "TelegramError";
  }
}

export class TelegramClient {
  constructor(private readonly fetcher: typeof fetch = fetch) {}

  async sendAlert(botToken: string, chatId: string, alert: TelegramAlert) {
    const response = await this.fetcher(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: formatTelegramAlert(alert),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        cache: "no-store",
      },
    );
    const body = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
      result?: { message_id?: number };
    };
    if (!response.ok || !body.ok)
      throw new TelegramError(
        body.description ?? "Telegram delivery failed.",
        response.status === 429 || response.status >= 500,
        response.status,
      );
    return { messageId: String(body.result?.message_id ?? "") };
  }
}
