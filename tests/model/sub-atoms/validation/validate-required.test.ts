// tests/model/sub-atoms/validation/validate-required.test.ts
import { describe, it, expect } from "bun:test";
import { validateRequired } from "@model/universal/sub-atoms/validation/validate-required";

describe("validateRequired", () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it("returns the value when a string is provided", () => {
    expect(validateRequired("hello", "name")).toBe("hello");
  });

  it("returns the value when a number is provided", () => {
    expect(validateRequired(42, "age")).toBe(42);
  });

  it("returns the value when a boolean is provided", () => {
    expect(validateRequired(true, "isActive")).toBe(true);
    expect(validateRequired(false, "isActive")).toBe(false);
  });

  it("returns the value when an empty string is provided", () => {
    // Empty string is not null/undefined — it passes required check
    expect(validateRequired("", "name")).toBe("");
  });

  it("returns the value when zero is provided", () => {
    expect(validateRequired(0, "count")).toBe(0);
  });

  // ── Error cases ─────────────────────────────────────────────────────────
  it("throws when value is null", () => {
    expect(() => validateRequired(null, "name")).toThrow("name is required");
  });

  it("throws when value is undefined", () => {
    expect(() => validateRequired(undefined, "name")).toThrow("name is required");
  });

  it("includes the field name in the error message", () => {
    expect(() => validateRequired(null, "description")).toThrow("description is required");
  });
});
