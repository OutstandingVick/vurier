import { describe, expect, it } from "vitest";
import { matchEvidence } from "@/core/proposals/evidence-matcher";
const item = (
  verified: boolean,
  title = "React fintech dashboard",
  description = "Next.js TypeScript",
  skills = ["React"],
) => ({
  id: crypto.randomUUID(),
  title,
  description,
  kind: "project" as const,
  skills,
  achievements: [],
  projectUrl: null,
  repositoryUrl: null,
  filePath: null,
  verified,
});
describe("evidence matching", () => {
  it("ranks only verified relevant evidence", () => {
    const result = matchEvidence("React Next.js dashboard", [
      item(false),
      item(true),
      item(true, "Unrelated writing", "Editorial sample", ["Copywriting"]),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].verified).toBe(true);
  });
});
