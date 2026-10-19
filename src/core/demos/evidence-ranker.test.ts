import { describe, expect, it } from "vitest";
import { rankPortfolioEvidence } from "./evidence-ranker";
import type { PortfolioEvidence } from "@/core/proposals/types";

const evidence: PortfolioEvidence[] = [
  {
    id: "1",
    title: "Fintech dashboard",
    description: "React analytics",
    kind: "project",
    skills: ["React", "Next.js"],
    achievements: ["Improved reporting"],
    projectUrl: null,
    repositoryUrl: null,
    filePath: null,
    verified: true,
  },
  {
    id: "2",
    title: "Unverified React app",
    description: "React",
    kind: "project",
    skills: ["React"],
    achievements: [],
    projectUrl: null,
    repositoryUrl: null,
    filePath: null,
    verified: false,
  },
  {
    id: "3",
    title: "Research report",
    description: "Fintech market analysis",
    kind: "writing_sample",
    skills: ["Research"],
    achievements: [],
    projectUrl: null,
    repositoryUrl: null,
    filePath: null,
    verified: true,
  },
];
describe("portfolio evidence ranking", () => {
  it("ranks verified evidence by weighted relevance", () =>
    expect(
      rankPortfolioEvidence(
        "React Next.js fintech dashboard",
        evidence,
        "prototype",
      )[0]?.id,
    ).toBe("1"));
  it("never returns unverified evidence", () =>
    expect(
      rankPortfolioEvidence("React", evidence, "prototype").some(
        (item) => item.id === "2",
      ),
    ).toBe(false));
  it("favours writing evidence for research samples", () =>
    expect(
      rankPortfolioEvidence("fintech research", evidence, "research_report")[0]
        ?.id,
    ).toBe("3"));
});
