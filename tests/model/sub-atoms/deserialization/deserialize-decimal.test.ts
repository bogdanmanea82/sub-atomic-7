// tests/model/sub-atoms/deserialization/deserialize-decimal.test.ts
import { describe, it, expect } from "bun:test";
import { deserializeDecimal } from "@model/universal/sub-atoms/deserialization/deserialize-decimal";

describe("deserializeDecimal", () => {
  it("parses string to number (PostgreSQL NUMERIC arrives as string)", () => {
    expect(deserializeDecimal("3.1400")).toBe(3.14);
  });

  it("parses integer string", () => {
    expect(deserializeDecimal("100")).toBe(100);
  });

  it("passes through number values", () => {
    expect(deserializeDecimal(42.5)).toBe(42.5);
  });

  it("parses zero string", () => {
    expect(deserializeDecimal("0")).toBe(0);
  });

  it("parses negative string", () => {
    expect(deserializeDecimal("-5.5")).toBe(-5.5);
  });

  it("returns 0 for unparseable string", () => {
    expect(deserializeDecimal("not-a-number")).toBe(0);
  });

  it("handles high precision strings", () => {
    expect(deserializeDecimal("1234.5678")).toBe(1234.5678);
  });
});
