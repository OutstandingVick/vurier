import type { EvidenceMatch, PortfolioEvidence } from "@/core/proposals/types";
const words = (value: string) =>
  new Set(value.toLowerCase().match(/[a-z0-9+#.]{3,}/g) ?? []);
export function matchEvidence(
  query: string,
  evidence: PortfolioEvidence[],
  limit = 5,
): EvidenceMatch[] {
  const terms = words(query);
  return evidence
    .filter((item) => item.verified)
    .map((item) => {
      const corpus = words(
        [
          item.title,
          item.description,
          ...item.skills,
          ...item.achievements,
        ].join(" "),
      );
      const matchedTerms = [...terms].filter((term) => corpus.has(term));
      const relevance = terms.size
        ? Math.round((matchedTerms.length / terms.size) * 100)
        : 0;
      return { ...item, relevance, matchedTerms };
    })
    .filter((item) => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}
