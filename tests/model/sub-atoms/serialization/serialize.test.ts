// tests/model/sub-atoms/serialization/serialize.test.ts
import { describe, it, expect } from "bun:test";
import { serializeString } from "@model/universal/sub-atoms/serialization/serialize-string";
import { serializeInteger } from "@model/universal/sub-atoms/serialization/serialize-integer";
import { serializeBoolean } from "@model/universal/sub-atoms/serialization/serialize-boolean";
import { serializeDatetime } from "@model/universal/sub-atoms/serialization/serialize-datetime";

// ═══════════════════════════════════════════════════════════════════════════
// serializeString
// ═══════════════════════════════════════════════════════════════════════════

describe("serializeString", () => {
  it("trims leading and trailing whitespace", () => {
    expect(serializeString("  hello  ")).toBe("hello");
  });

  it("trims tabs and newlines", () => {
    expect(serializeString("\thello\n")).toBe("hello");
  });

  it("preserves internal whitespace", () => {
    expect(serializeString("hello world")).toBe("hello world");
  });

  it("returns null for null input", () => {
    expect(serializeString(null)).toBeNull();
  });

  it("returns empty string when input is only whitespace", () => {
    expect(serializeString("   ")).toBe("");
  });

  it("returns the string unchanged when no trimming needed", () => {
    expect(serializeString("clean")).toBe("clean");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// serializeInteger
// ═══════════════════════════════════════════════════════════════════════════

describe("serializeInteger", () => {
  it("passes through positive integers", () => {
    expect(serializeInteger(42)).toBe(42);
  });

  it("passes through zero", () => {
    expect(serializeInteger(0)).toBe(0);
  });

  it("passes through negative integers", () => {
    expect(serializeInteger(-5)).toBe(-5);
  });

  it("returns null for null input", () => {
    expect(serializeInteger(null)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// serializeBoolean
// ═══════════════════════════════════════════════════════════════════════════

describe("serializeBoolean", () => {
  it("passes through true", () => {
    expect(serializeBoolean(true)).toBe(true);
  });

  it("passes through false", () => {
    expect(serializeBoolean(false)).toBe(false);
  });

  it("returns null for null input", () => {
    expect(serializeBoolean(null)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// serializeDatetime
// ═══════════════════════════════════════════════════════════════════════════

describe("serializeDatetime", () => {
  it("converts a Date to ISO string", () => {
    const date = new Date("2025-06-15T10:30:00.000Z");
    expect(serializeDatetime(date)).toBe("2025-06-15T10:30:00.000Z");
  });

  it("converts epoch Date to ISO string", () => {
    const date = new Date(0);
    expect(serializeDatetime(date)).toBe("1970-01-01T00:00:00.000Z");
  });

  it("returns null for null input", () => {
    expect(serializeDatetime(null)).toBeNull();
  });

  it("includes millisecond precision", () => {
    const date = new Date("2025-01-01T00:00:00.123Z");
    expect(serializeDatetime(date)).toBe("2025-01-01T00:00:00.123Z");
  });
});
