// tests/model/sub-atoms/validation/validate-boolean.test.ts
import { describe, it, expect } from "bun:test";
import { validateBoolean } from "@model/universal/sub-atoms/validation/validate-boolean";

describe("validateBoolean", () => {
  // ── Native boolean input ────────────────────────────────────────────────
  it("returns true for boolean true", () => {
    expect(validateBoolean(true, "is_active")).toBe(true);
  });

  it("returns false for boolean false", () => {
    expect(validateBoolean(false, "is_active")).toBe(false);
  });

  // ── Number input (form data can arrive as 1/0) ─────────────────────────
  it("returns true for number 1", () => {
    expect(validateBoolean(1, "is_active")).toBe(true);
  });

  it("returns false for number 0", () => {
    expect(validateBoolean(0, "is_active")).toBe(false);
  });

  // ── String input (browser forms submit strings) ────────────────────────
  it('returns true for string "true"', () => {
    expect(validateBoolean("true", "is_active")).toBe(true);
  });

  it('returns false for string "false"', () => {
    expect(validateBoolean("false", "is_active")).toBe(false);
  });

  it('returns true for string "1"', () => {
    expect(validateBoolean("1", "is_active")).toBe(true);
  });

  it('returns false for string "0"', () => {
    expect(validateBoolean("0", "is_active")).toBe(false);
  });

  it("is case-insensitive for string input", () => {
    expect(validateBoolean("TRUE", "is_active")).toBe(true);
    expect(validateBoolean("FALSE", "is_active")).toBe(false);
    expect(validateBoolean("True", "is_active")).toBe(true);
    expect(validateBoolean("False", "is_active")).toBe(false);
  });

  // ── Invalid input ──────────────────────────────────────────────────────
  it('rejects string "yes"', () => {
    expect(() => validateBoolean("yes" as unknown as boolean, "is_active")).toThrow(
      "is_active must be a valid boolean value"
    );
  });

  it('rejects string "no"', () => {
    expect(() => validateBoolean("no" as unknown as boolean, "is_active")).toThrow(
      "is_active must be a valid boolean value"
    );
  });

  it("rejects number 2", () => {
    expect(() => validateBoolean(2, "is_active")).toThrow(
      "is_active must be a valid boolean value"
    );
  });

  it("rejects number -1", () => {
    expect(() => validateBoolean(-1, "is_active")).toThrow(
      "is_active must be a valid boolean value"
    );
  });

  it('rejects empty string', () => {
    expect(() => validateBoolean("", "is_active")).toThrow(
      "is_active must be a valid boolean value"
    );
  });

  it('rejects arbitrary string', () => {
    expect(() => validateBoolean("maybe" as unknown as boolean, "is_active")).toThrow(
      "is_active must be a valid boolean value"
    );
  });
});
