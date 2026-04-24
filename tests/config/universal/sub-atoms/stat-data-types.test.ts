// tests/config/universal/sub-atoms/stat-data-types.test.ts
// Verifies STAT_DATA_TYPES has exactly 3 values with the correct string literals.
// The distinction matters: 'raw' skips scaling, 'percentage' renders as %, 'multiplier' divides by 100.

import { describe, it, expect } from "bun:test";
import {
  STAT_DATA_TYPES,
  STAT_DATA_TYPE_RAW,
  STAT_DATA_TYPE_PERCENTAGE,
  STAT_DATA_TYPE_MULTIPLIER,
} from "../../../../src/config/universal/sub-atoms/stat-data-types";

describe("STAT_DATA_TYPES", () => {
  // ── Individual constants ───────────────────────────────────────────────

  it("STAT_DATA_TYPE_RAW is 'raw'", () => {
    expect(STAT_DATA_TYPE_RAW).toBe("raw");
  });

  it("STAT_DATA_TYPE_PERCENTAGE is 'percentage'", () => {
    expect(STAT_DATA_TYPE_PERCENTAGE).toBe("percentage");
  });

  it("STAT_DATA_TYPE_MULTIPLIER is 'multiplier'", () => {
    expect(STAT_DATA_TYPE_MULTIPLIER).toBe("multiplier");
  });

  // ── Grouped object ─────────────────────────────────────────────────────

  it("STAT_DATA_TYPES.raw matches the individual constant", () => {
    expect(STAT_DATA_TYPES.raw).toBe(STAT_DATA_TYPE_RAW);
  });

  it("STAT_DATA_TYPES.percentage matches the individual constant", () => {
    expect(STAT_DATA_TYPES.percentage).toBe(STAT_DATA_TYPE_PERCENTAGE);
  });

  it("STAT_DATA_TYPES.multiplier matches the individual constant", () => {
    expect(STAT_DATA_TYPES.multiplier).toBe(STAT_DATA_TYPE_MULTIPLIER);
  });

  it("STAT_DATA_TYPES has exactly 3 entries — no accidental additions or omissions", () => {
    expect(Object.keys(STAT_DATA_TYPES)).toHaveLength(3);
  });
});
