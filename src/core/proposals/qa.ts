import type {
  DraftContent,
  PortfolioEvidence,
  QaResult,
} from "@/core/proposals/types";
import { endsWithQuestion, firstTwoLines } from "@/core/proposals/opening";
import { findStyleWarnings } from "@/core/proposals/style";
const CLAIM_PATTERN =
  /\b(?:increased|reduced|grew|saved|delivered|built|led|achieved)\b[^.!?]*(?:\d+%?|\$[\d,]+|for\s+[A-Z][\w-]+)/gi;
export function validateProposal(
  draft: DraftContent,
  evidence: PortfolioEvidence[],
  jobText: string,
): QaResult {
  void jobText;
  const verifiedCorpus = [
    ...evidence
      .filter((item) => item.verified)
      .flatMap((item) => [
        item.title,
        item.description,
        item.projectUrl ?? "",
        item.repositoryUrl ?? "",
        ...item.achievements,
      ]),
  ]
    .join(" ")
    .toLowerCase();
  const claims = draft.coverLetter.match(CLAIM_PATTERN) ?? [];
  const unsupportedClaims = claims.filter(
    (claim) => !verifiedCorpus.includes(claim.toLowerCase()),
  );
  const warnings: string[] = findStyleWarnings(draft.coverLetter);
  if (
    !endsWithQuestion(draft.coverLetter) ||
    !draft.coverLetter.trim().endsWith(draft.closingQuestion.trim())
  )
    warnings.push("The proposal must end with its specific question.");
  const first = firstTwoLines(draft.coverLetter).join(" ");
  if (
    !first
      .toLowerCase()
      .includes(draft.openingLines[0].toLowerCase().slice(0, 20))
  )
    warnings.push(
      "Opening lines do not match the generated client-focused hook.",
    );
  return {
    passed: unsupportedClaims.length === 0 && warnings.length === 0,
    scores: {
      personalization: warnings.length ? 70 : 90,
      factualAccuracy: unsupportedClaims.length ? 40 : 100,
      relevance: 90,
      clarity: 90,
      clientFocus: 90,
      style: warnings.length ? 65 : 90,
    },
    unsupportedClaims,
    warnings,
  };
}
