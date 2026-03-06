// tests/model/sub-atoms/validation/validate-datetime.test.ts
import { describe, it, expect } from "bun:test";
import { validateDatetime } from "@model/universal/sub-atoms/validation/validate-datetime";

describe("validateDatetime", () => {
  // ── Date object input ──────────────────────────────────────────────────
  it("returns the same Date when a valid Date is provided", () => {
    const date = new Date("2025-01-15T10:30:00Z");
    const result = validateDatetime(date, "created_at");
    expect(result.getTime()).toBe(date.getTime());
  });

  // ── ISO string input ───────────────────────────────────────────────────
  it("parses a valid ISO string into a Date", () => {
    const result = validateDatetime("2025-06-01T14:30:00.000Z", "created_at");
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe("2025-06-01T14:30:00.000Z");
  });

  it("parses a date-only string", () => {
    const result = validateDatetime("2025-01-15", "created_at");
    expect(result).toBeInstanceOf(Date);
    expect(isNaN(result.getTime())).toBe(false);
  });

  // ── Number (timestamp) input ───────────────────────────────────────────
  it("parses a Unix timestamp in milliseconds", () => {
    const timestamp = Date.now();
    const result = validateDatetime(timestamp, "created_at");
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(timestamp);
  });

  it("parses timestamp 0 (epoch)", () => {
    const result = validateDatetime(0, "created_at");
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });

  // ── Invalid input ──────────────────────────────────────────────────────
  it("throws for an invalid date string", () => {
    expect(() => validateDatetime("not-a-date", "created_at")).toThrow(
      "created_at must be a valid date"
    );
  });

  it("throws for an empty string", () => {
    expect(() => validateDatetime("", "created_at")).toThrow(
      "created_at must be a valid date"
    );
  });

  it("throws for an invalid Date object", () => {
    expect(() => validateDatetime(new Date("invalid"), "created_at")).toThrow(
      "created_at must be a valid date"
    );
  });
});
