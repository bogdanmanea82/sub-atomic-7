// tests/config/universal/sub-atoms/combination-types.test.ts
// Verifies COMBINATION_TYPES has exactly 3 values with the correct string literals.
// These drive the PoE math buckets: base + Σflat, ×(1+Σincreased), ×Πmore.

import { describe, it, expect } from "bun:test";
import {
  COMBINATION_TYPES,
  COMBINATION_TYPE_FLAT,
  COMBINATION_TYPE_INCREASED,
  COMBINATION_TYPE_MORE,
} from "../../../../src/config/universal/sub-atoms/combination-types";

describe("COMBINATION_TYPES", () => {
  // ── Individual constants ───────────────────────────────────────────────

  it("COMBINATION_TYPE_FLAT is 'flat'", () => {
    expect(COMBINATION_TYPE_FLAT).toBe("flat");
  });

  it("COMBINATION_TYPE_INCREASED is 'increased'", () => {
    expect(COMBINATION_TYPE_INCREASED).toBe("increased");
  });

  it("COMBINATION_TYPE_MORE is 'more'", () => {
    expect(COMBINATION_TYPE_MORE).toBe("more");
  });

  // ── Grouped object ─────────────────────────────────────────────────────

  it("COMBINATION_TYPES.flat matches the individual constant", () => {
    expect(COMBINATION_TYPES.flat).toBe(COMBINATION_TYPE_FLAT);
  });

  it("COMBINATION_TYPES.increased matches the individual constant", () => {
    expect(COMBINATION_TYPES.increased).toBe(COMBINATION_TYPE_INCREASED);
  });

  it("COMBINATION_TYPES.more matches the individual constant", () => {
    expect(COMBINATION_TYPES.more).toBe(COMBINATION_TYPE_MORE);
  });

  it("COMBINATION_TYPES has exactly 3 entries — no accidental additions or omissions", () => {
    expect(Object.keys(COMBINATION_TYPES)).toHaveLength(3);
  });
});
