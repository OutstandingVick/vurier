import { describe, expect, it } from "vitest";
import { suggestedDemoKind } from "./kind";
describe("sample kind selection", () => {
  it("uses writing samples for writing jobs", () =>
    expect(
      suggestedDemoKind(
        "Technical Writing",
        "Write article",
        "developer tutorial",
      ),
    ).toBe("writing_sample"));
  it("uses research reports for research work", () =>
    expect(
      suggestedDemoKind("Research", "Fintech analyst", "market research"),
    ).toBe("research_report"));
  it("defaults product work to a prototype", () =>
    expect(suggestedDemoKind("Frontend", "React dashboard", "build UI")).toBe(
      "prototype",
    ));
});
