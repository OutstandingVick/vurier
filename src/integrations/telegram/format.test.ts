import { describe, expect, it } from "vitest";
import { formatTelegramAlert } from "./format";

describe("Telegram alert format", () => {
  it("escapes untrusted job content and includes both links", () => {
    const text = formatTelegramAlert({
      title: "<script>job</script>",
      budget: "$1,000",
      score: 91,
      insights: ["Strong React fit"],
      vurierUrl: "https://vurier.test/opportunity",
      upworkUrl: "https://upwork.test/job",
    });
    expect(text).not.toContain("<script>");
    expect(text).toContain("Match 91/100");
    expect(text).toContain("Review in Vurier");
    expect(text).toContain("View on Upwork");
  });
  it("encodes quotes in link attributes", () => {
    const text = formatTelegramAlert({
      title: "Job",
      budget: "$1",
      score: 80,
      insights: [],
      vurierUrl: "https://vurier.test/x?q=%22onclick%3D%22x",
      upworkUrl: null,
    });
    expect(text).not.toContain('"onclick="');
  });
});
