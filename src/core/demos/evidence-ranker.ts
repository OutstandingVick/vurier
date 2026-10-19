import type { PortfolioEvidence } from "@/core/proposals/types";
import type { DemoKind, RankedEvidence } from "./types";

const words = (value: string) =>
  new Set(value.toLowerCase().match(/[a-z0-9+#.]{2,}/g) ?? []);
const kindAffinity: Record<DemoKind, string[]> = {
  prototype: ["project", "experience"],
  technical_audit: ["project", "experience", "achievement"],
  research_report: ["writing_sample", "experience", "achievement"],
  writing_sample: ["writing_sample", "achievement"],
  content_strategy: ["writing_sample", "experience"],
};

export function rankPortfolioEvidence(
  query: string,
  evidence: PortfolioEvidence[],
  kind: DemoKind,
  limit = 8,
): RankedEvidence[] {
  const queryTerms = words(query);
  return evidence
    .filter((item) => item.verified)
    .map((item) => {
      const title = words(item.title);
      const skills = words(item.skills.join(" "));
      const body = words([item.description, ...item.achievements].join(" "));
      const titleMatches = [...queryTerms].filter((term) => title.has(term));
      const skillMatches = [...queryTerms].filter((term) => skills.has(term));
      const bodyMatches = [...queryTerms].filter((term) => body.has(term));
      const affinity = kindAffinity[kind].includes(item.kind) ? 15 : 0;
      const relevance = Math.min(
        100,
        titleMatches.length * 12 +
          skillMatches.length * 9 +
          bodyMatches.length * 4 +
          affinity +
          Math.min(item.achievements.length * 3, 12),
      );
      const reasons = [
        ...new Set([...titleMatches, ...skillMatches, ...bodyMatches]),
      ]
        .slice(0, 8)
        .map((term) => `Matches “${term}”`);
      if (affinity)
        reasons.push(`Evidence type supports a ${kind.replaceAll("_", " ")}`);
      return { ...item, relevance, reasons };
    })
    .filter((item) => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || a.title.localeCompare(b.title))
    .slice(0, limit);
}
