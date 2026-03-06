// tests/model/sub-atoms/validation/validate-string-length.test.ts
import { describe, it, expect } from "bun:test";
import { validateStringLength } from "@model/universal/sub-atoms/validation/validate-string-length";

describe("validateStringLength", () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it("returns the value when length is within bounds", () => {
    expect(validateStringLength("hello", 3, 255, "name")).toBe("hello");
  });

  it("accepts a string at exactly the minimum length", () => {
    expect(validateStringLength("abc", 3, 255, "name")).toBe("abc");
  });

  it("accepts a string at exactly the maximum length", () => {
    const maxString = "a".repeat(255);
    expect(validateStringLength(maxString, 3, 255, "name")).toBe(maxString);
  });

  it("accepts a long description within bounds", () => {
    const desc = "a".repeat(5000);
    expect(validateStringLength(desc, 3, 5000, "description")).toBe(desc);
  });

  // ── Too short ───────────────────────────────────────────────────────────
  it("throws when string is shorter than minimum", () => {
    expect(() => validateStringLength("ab", 3, 255, "name")).toThrow(
      "name must be at least 3 characters"
    );
  });

  it("throws when string is empty and minimum is 1", () => {
    expect(() => validateStringLength("", 1, 255, "name")).toThrow(
      "name must be at least 1 characters"
    );
  });

  it("throws for single character when minimum is 3", () => {
    expect(() => validateStringLength("a", 3, 255, "name")).toThrow(
      "name must be at least 3 characters"
    );
  });

  // ── Too long ────────────────────────────────────────────────────────────
  it("throws when string exceeds maximum length", () => {
    const tooLong = "a".repeat(256);
    expect(() => validateStringLength(tooLong, 3, 255, "name")).toThrow(
      "name must be no more than 255 characters"
    );
  });

  it("throws for description exceeding 5000 characters", () => {
    const tooLong = "a".repeat(5001);
    expect(() => validateStringLength(tooLong, 3, 5000, "description")).toThrow(
      "description must be no more than 5000 characters"
    );
  });

  // ── Edge: one character off the boundary ─────────────────────────────────
  it("rejects string one character below minimum", () => {
    expect(() => validateStringLength("ab", 3, 10, "name")).toThrow();
  });

  it("rejects string one character above maximum", () => {
    const oneOver = "a".repeat(11);
    expect(() => validateStringLength(oneOver, 3, 10, "name")).toThrow();
  });
});
