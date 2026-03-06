// tests/model/sub-atoms/validation/validate-integer-range.test.ts
import { describe, it, expect } from "bun:test";
import { validateIntegerRange } from "@model/universal/sub-atoms/validation/validate-integer-range";

describe("validateIntegerRange", () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it("returns the value when within range", () => {
    expect(validateIntegerRange(50, 0, 100, "percentage")).toBe(50);
  });

  it("accepts value at exactly the minimum", () => {
    expect(validateIntegerRange(0, 0, 100, "percentage")).toBe(0);
  });

  it("accepts value at exactly the maximum", () => {
    expect(validateIntegerRange(100, 0, 100, "percentage")).toBe(100);
  });

  it("accepts large values within standard range", () => {
    expect(validateIntegerRange(2147483647, 0, 2147483647, "count")).toBe(2147483647);
  });

  // ── Below minimum ──────────────────────────────────────────────────────
  it("throws when value is below minimum", () => {
    expect(() => validateIntegerRange(-1, 0, 100, "percentage")).toThrow(
      "percentage must be at least 0"
    );
  });

  it("throws when value is one below minimum for positive range", () => {
    expect(() => validateIntegerRange(0, 1, 100, "level")).toThrow(
      "level must be at least 1"
    );
  });

  // ── Above maximum ─────────────────────────────────────────────────────
  it("throws when value exceeds maximum", () => {
    expect(() => validateIntegerRange(101, 0, 100, "percentage")).toThrow(
      "percentage must be no more than 100"
    );
  });

  it("throws when value is one above maximum", () => {
    expect(() => validateIntegerRange(256, 0, 255, "score")).toThrow(
      "score must be no more than 255"
    );
  });

  // ── Negative ranges ───────────────────────────────────────────────────
  it("handles negative ranges correctly", () => {
    expect(validateIntegerRange(-5, -10, 10, "offset")).toBe(-5);
  });

  it("rejects value below negative minimum", () => {
    expect(() => validateIntegerRange(-11, -10, 10, "offset")).toThrow();
  });
});
