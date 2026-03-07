// tests/model/sub-atoms/serialization/serialize-decimal.test.ts
import { describe, it, expect } from "bun:test";
import { serializeDecimal } from "@model/universal/sub-atoms/serialization/serialize-decimal";

describe("serializeDecimal", () => {
  it("converts number to string", () => {
    expect(serializeDecimal(3.14)).toBe("3.14");
  });

  it("converts zero to string", () => {
    expect(serializeDecimal(0)).toBe("0");
  });

  it("converts negative number to string", () => {
    expect(serializeDecimal(-5.5)).toBe("-5.5");
  });

  it("preserves high precision", () => {
    expect(serializeDecimal(1.1234)).toBe("1.1234");
  });

  it("returns null for null input", () => {
    expect(serializeDecimal(null)).toBeNull();
  });

  it("converts integer to string without decimal point issues", () => {
    expect(serializeDecimal(100)).toBe("100");
  });
});
