import { describe, expect, it } from "vitest";
import { mapMatchingProfile } from "@/core/opportunities/mapper";
describe("matching profile mapper", () => {
  it("uses only explicitly verified skills", () => {
    const result = mapMatchingProfile(
      {
        skills: ["unverified"],
        verified_skills: ["React"],
        bio: "Senior engineer",
      },
      null,
      [],
    );
    expect(result.verifiedSkills).toEqual(["React"]);
  });
});
