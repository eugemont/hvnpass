import { describe, expect, it } from "vitest";
import { generateQrToken } from "../lib/qr";

describe("generateQrToken", () => {
  it("produces url-safe, sufficiently long, unique tokens", () => {
    const tokens = new Set(Array.from({ length: 1000 }, () => generateQrToken()));
    expect(tokens.size).toBe(1000);
    for (const token of tokens) {
      expect(token.length).toBeGreaterThanOrEqual(30);
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });
});
