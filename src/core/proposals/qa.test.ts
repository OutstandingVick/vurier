import { describe, expect, it } from "vitest";
import { validateProposal } from "@/core/proposals/qa";
const draft = (coverLetter: string) => ({
  coverLetter,
  openingLines: [
    "You need a fast React rebuild.",
    "I can deliver an accessible migration.",
  ] as [string, string],
  closingQuestion: "Which flow should we prioritize?",
  milestones: [],
  screeningAnswers: [],
  attachmentIds: [],
});
describe("proposal QA", () => {
  it("flags unsupported quantified achievements", () =>
    expect(
      validateProposal(
        draft(
          "You need a fast React rebuild.\nI can deliver an accessible migration.\nI increased revenue 80%.\nWhich flow should we prioritize?",
        ),
        [],
        "React rebuild",
      ).unsupportedClaims,
    ).toHaveLength(1));
  it("passes grounded client-first copy", () =>
    expect(
      validateProposal(
        draft(
          "You need a fast React rebuild.\nI can deliver an accessible migration.\nWhich flow should we prioritize?",
        ),
        [],
        "React rebuild",
      ).passed,
    ).toBe(true));
});
