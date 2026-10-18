import type { TelegramAlert } from "./types";

const escape = (value: string) =>
  value.replace(
    /[&<>]/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]!,
  );

export function formatTelegramAlert(alert: TelegramAlert) {
  const insights = alert.insights
    .slice(0, 3)
    .map((item) => `• ${escape(item)}`)
    .join("\n");
  const links = [
    `<a href="${escape(alert.vurierUrl)}">Review in Vurier</a>`,
    alert.upworkUrl
      ? `<a href="${escape(alert.upworkUrl)}">View on Upwork</a>`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return `<b>${escape(alert.title)}</b>\n${escape(alert.budget)} · Match ${alert.score}/100\n\n${insights}\n\n${links}`;
}
