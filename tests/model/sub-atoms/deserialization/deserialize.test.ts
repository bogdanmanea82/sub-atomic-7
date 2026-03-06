// tests/model/sub-atoms/deserialization/deserialize.test.ts
import { describe, it, expect } from "bun:test";
import { deserializeString } from "@model/universal/sub-atoms/deserialization/deserialize-string";
import { deserializeInteger } from "@model/universal/sub-atoms/deserialization/deserialize-integer";
import { deserializeBoolean } from "@model/universal/sub-atoms/deserialization/deserialize-boolean";
import { deserializeDatetime } from "@model/universal/sub-atoms/deserialization/deserialize-datetime";

// ═══════════════════════════════════════════════════════════════════════════
// deserializeString
// ═══════════════════════════════════════════════════════════════════════════

describe("deserializeString", () => {
  it("passes through a string value", () => {
    expect(deserializeString("hello")).toBe("hello");
  });

  it("passes through an empty string", () => {
    expect(deserializeString("")).toBe("");
  });

  it("returns null for null input", () => {
    expect(deserializeString(null)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// deserializeInteger
// ═══════════════════════════════════════════════════════════════════════════

describe("deserializeInteger", () => {
  it("passes through a positive integer", () => {
    expect(deserializeInteger(42)).toBe(42);
  });

  it("passes through zero", () => {
    expect(deserializeInteger(0)).toBe(0);
  });

  it("passes through a negative integer", () => {
    expect(deserializeInteger(-10)).toBe(-10);
  });

  it("returns null for null input", () => {
    expect(deserializeInteger(null)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// deserializeBoolean
// ═══════════════════════════════════════════════════════════════════════════

describe("deserializeBoolean", () => {
  // PostgreSQL returns native booleans
  it("passes through boolean true", () => {
    expect(deserializeBoolean(true)).toBe(true);
  });

  it("passes through boolean false", () => {
    expect(deserializeBoolean(false)).toBe(false);
  });

  // SQLite fallback returns integers
  it("converts integer 1 to true", () => {
    expect(deserializeBoolean(1)).toBe(true);
  });

  it("converts integer 0 to false", () => {
    expect(deserializeBoolean(0)).toBe(false);
  });

  it("returns null for null input", () => {
    expect(deserializeBoolean(null)).toBeNull();
  });

  // Edge: other integers treated as false (only 1 maps to true)
  it("converts integer 2 to false (only 1 is truthy)", () => {
    expect(deserializeBoolean(2)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// deserializeDatetime
// ═══════════════════════════════════════════════════════════════════════════

describe("deserializeDatetime", () => {
  it("converts an ISO string to Date", () => {
    const result = deserializeDatetime(new Date("2025-06-15T10:30:00.000Z"));
    expect(result).toBeInstanceOf(Date);
    expect(result!.toISOString()).toBe("2025-06-15T10:30:00.000Z");
  });

  it("handles Date objects from the database", () => {
    const dbDate = new Date("2025-01-01T00:00:00.000Z");
    const result = deserializeDatetime(dbDate);
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBe(dbDate.getTime());
  });

  it("returns null for null input", () => {
    expect(deserializeDatetime(null)).toBeNull();
  });
});
