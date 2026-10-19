import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const config = readFileSync(new URL("../../../next.config.ts", import.meta.url), "utf8");
const vercel = JSON.parse(readFileSync(new URL("../../../vercel.json", import.meta.url), "utf8"));
describe("production configuration", () => {
  it("sets baseline browser security headers", () => { for (const header of ["Content-Security-Policy", "X-Content-Type-Options", "X-Frame-Options", "Strict-Transport-Security", "Permissions-Policy"]) expect(config).toContain(header); });
  it("uses reproducible Vercel installs and the verified build command", () => { expect(vercel).toMatchObject({ framework: "nextjs", installCommand: "npm ci", buildCommand: "npm run build" }); });
});
