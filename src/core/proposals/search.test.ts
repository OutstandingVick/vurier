import { describe, expect, it } from "vitest";
import { searchPortfolio } from "@/core/proposals/search";
const items = [
  {
    id: "1",
    title: "Fintech UI",
    description: "React dashboard",
    kind: "project" as const,
    skills: ["React"],
    achievements: [],
    projectUrl: null,
    repositoryUrl: null,
    filePath: null,
    verified: true,
  },
];
describe("portfolio search", () => {
  it("filters by text and category", () => {
    expect(searchPortfolio(items, "React", "project")).toHaveLength(1);
    expect(searchPortfolio(items, "React", "resume")).toHaveLength(0);
  });
});
