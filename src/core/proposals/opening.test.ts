import { describe, expect, it } from "vitest";
import { endsWithQuestion, firstTwoLines } from "@/core/proposals/opening";
describe("proposal structure", () => { it("extracts the client-first opening", () => expect(firstTwoLines("Problem\nValue\nProof")).toEqual(["Problem","Value"])); it("requires a closing question", () => { expect(endsWithQuestion("Which flow comes first?")).toBe(true); expect(endsWithQuestion("Let me know.")).toBe(false); }); });
