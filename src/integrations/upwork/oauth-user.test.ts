import { describe, expect, it } from "vitest";
import { oauthUserMatches } from "./oauth";
describe("Upwork OAuth user binding", () => {
  it("accepts the initiating signed-in user", () =>
    expect(oauthUserMatches("user-a", "user-a")).toBe(true));
  it("rejects missing and switched sessions", () => {
    expect(oauthUserMatches(undefined, "user-a")).toBe(false);
    expect(oauthUserMatches("user-a", "user-b")).toBe(false);
  });
});
