// tests/model/sub-atoms/validation/validate-boolean.test.ts
import { describe, it, expect } from "bun:test";
import { validateBoolean } from "@model/universal/sub-atoms/validation/validate-boolean";

describe("validateBoolean", () => {
  // ── Native boolean input ────────────────────────────────────────────────
  it("returns true for boolean true", () => {
    expect(validateBoolean(true, "isActive")).toBe(true);
  });

  it("returns false for boolean false", () => {
    expect(validateBoolean(false, "isActive")).toBe(false);
  });

  // ── Number input (form data can arrive as 1/0) ─────────────────────────
  it("returns true for number 1", () => {
    expect(validateBoolean(1, "isActive")).toBe(true);
  });

  it("returns false for number 0", () => {
    expect(validateBoolean(0, "isActive")).toBe(false);
  });

  // ── String input (browser forms submit strings) ────────────────────────
  it('returns true for string "true"', () => {
    expect(validateBoolean("true", "isActive")).toBe(true);
  });

  it('returns false for string "false"', () => {
    expect(validateBoolean("false", "isActive")).toBe(false);
  });

  it('returns true for string "1"', () => {
    expect(validateBoolean("1", "isActive")).toBe(true);
  });

  it('returns false for string "0"', () => {
    expect(validateBoolean("0", "isActive")).toBe(false);
  });

  it("is case-insensitive for string input", () => {
    expect(validateBoolean("TRUE", "isActive")).toBe(true);
    expect(validateBoolean("FALSE", "isActive")).toBe(false);
    expect(validateBoolean("True", "isActive")).toBe(true);
    expect(validateBoolean("False", "isActive")).toBe(false);
  });

  // ── Invalid input ──────────────────────────────────────────────────────
  it('rejects string "yes"', () => {
    expect(() => validateBoolean("yes" as unknown as boolean, "isActive")).toThrow(
      "isActive must be a valid boolean value"
    );
  });

  it('rejects string "no"', () => {
    expect(() => validateBoolean("no" as unknown as boolean, "isActive")).toThrow(
      "isActive must be a valid boolean value"
    );
  });

  it("rejects number 2", () => {
    expect(() => validateBoolean(2, "isActive")).toThrow(
      "isActive must be a valid boolean value"
    );
  });

  it("rejects number -1", () => {
    expect(() => validateBoolean(-1, "isActive")).toThrow(
      "isActive must be a valid boolean value"
    );
  });

  it('rejects empty string', () => {
    expect(() => validateBoolean("", "isActive")).toThrow(
      "isActive must be a valid boolean value"
    );
  });

  it('rejects arbitrary string', () => {
    expect(() => validateBoolean("maybe" as unknown as boolean, "isActive")).toThrow(
      "isActive must be a valid boolean value"
    );
  });
});
