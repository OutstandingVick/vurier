import type { DemoKind } from "./types";

export function suggestedDemoKind(
  category: string | null,
  title: string,
  description: string,
): DemoKind {
  const text = `${category ?? ""} ${title} ${description}`.toLowerCase();
  if (/technical writing|article|blog|copywriting|whitepaper/.test(text))
    return "writing_sample";
  if (/research|market analysis|fintech analysis/.test(text))
    return "research_report";
  if (/audit|review|assessment/.test(text)) return "technical_audit";
  if (/content strategy|seo strategy|editorial/.test(text))
    return "content_strategy";
  return "prototype";
}
