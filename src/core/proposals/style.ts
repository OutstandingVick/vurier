const BANNED = [/\bi am excited to apply\b/i, /\bdear hiring manager\b/i, /\bleverage\b/i, /\bgame[- ]changer\b/i, /\bcutting[- ]edge\b/i, /\bdelve\b/i];
export function findStyleWarnings(text: string) { return BANNED.filter((pattern) => pattern.test(text)).map((pattern) => `Avoid generic or AI-style phrase: ${pattern.source.replaceAll("\\b", "")}.`); }
