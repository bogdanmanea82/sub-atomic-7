// tests/model/sub-atoms/validation/validate-decimal.test.ts
import { describe, it, expect } from "bun:test";
import { validateDecimal } from "@model/universal/sub-atoms/validation/validate-decimal";

describe("validateDecimal", () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it("returns the value when valid", () => {
    expect(validateDecimal(3.14, "value")).toBe(3.14);
  });

  it("accepts zero", () => {
    expect(validateDecimal(0, "value")).toBe(0);
  });

  it("accepts negative numbers", () => {
    expect(validateDecimal(-5.5, "value")).toBe(-5.5);
  });

  it("accepts value at exact min", () => {
    expect(validateDecimal(0, "value", 0, 100)).toBe(0);
  });

  it("accepts value at exact max", () => {
    expect(validateDecimal(100, "value", 0, 100)).toBe(100);
  });

  it("accepts value within range", () => {
    expect(validateDecimal(50.1234, "value", 0, 100)).toBe(50.1234);
  });

  // ── Type errors ─────────────────────────────────────────────────────────
  it("throws for NaN", () => {
    expect(() => validateDecimal(NaN, "value")).toThrow("must be a valid number");
  });

  it("throws for non-number type", () => {
    expect(() => validateDecimal("3.14" as unknown as number, "value")).toThrow("must be a valid number");
  });

  // ── Range errors ────────────────────────────────────────────────────────
  it("throws when below min", () => {
    expect(() => validateDecimal(-1, "value", 0, 100)).toThrow("must be at least 0");
  });

  it("throws when above max", () => {
    expect(() => validateDecimal(101, "value", 0, 100)).toThrow("must be at most 100");
  });

  // ── No range constraints ────────────────────────────────────────────────
  it("allows any value when no min/max provided", () => {
    expect(validateDecimal(-999999.9999, "value")).toBe(-999999.9999);
    expect(validateDecimal(999999.9999, "value")).toBe(999999.9999);
  });
});
