// tests/config/universal/sub-atoms/stat-categories.test.ts
// Verifies STAT_CATEGORIES has exactly 5 values with the correct string literals.

import { describe, it, expect } from "bun:test";
import {
  STAT_CATEGORIES,
  STAT_CATEGORY_ATTRIBUTE,
  STAT_CATEGORY_RESOURCE,
  STAT_CATEGORY_OFFENSIVE,
  STAT_CATEGORY_DEFENSIVE,
  STAT_CATEGORY_UTILITY,
} from "../../../../src/config/universal/sub-atoms/stat-categories";

describe("STAT_CATEGORIES", () => {
  // ── Individual constants ───────────────────────────────────────────────

  it("STAT_CATEGORY_ATTRIBUTE is 'attribute'", () => {
    expect(STAT_CATEGORY_ATTRIBUTE).toBe("attribute");
  });

  it("STAT_CATEGORY_RESOURCE is 'resource'", () => {
    expect(STAT_CATEGORY_RESOURCE).toBe("resource");
  });

  it("STAT_CATEGORY_OFFENSIVE is 'offensive'", () => {
    expect(STAT_CATEGORY_OFFENSIVE).toBe("offensive");
  });

  it("STAT_CATEGORY_DEFENSIVE is 'defensive'", () => {
    expect(STAT_CATEGORY_DEFENSIVE).toBe("defensive");
  });

  it("STAT_CATEGORY_UTILITY is 'utility'", () => {
    expect(STAT_CATEGORY_UTILITY).toBe("utility");
  });

  // ── Grouped object ─────────────────────────────────────────────────────

  it("STAT_CATEGORIES.attribute matches the individual constant", () => {
    expect(STAT_CATEGORIES.attribute).toBe(STAT_CATEGORY_ATTRIBUTE);
  });

  it("STAT_CATEGORIES.resource matches the individual constant", () => {
    expect(STAT_CATEGORIES.resource).toBe(STAT_CATEGORY_RESOURCE);
  });

  it("STAT_CATEGORIES.offensive matches the individual constant", () => {
    expect(STAT_CATEGORIES.offensive).toBe(STAT_CATEGORY_OFFENSIVE);
  });

  it("STAT_CATEGORIES.defensive matches the individual constant", () => {
    expect(STAT_CATEGORIES.defensive).toBe(STAT_CATEGORY_DEFENSIVE);
  });

  it("STAT_CATEGORIES.utility matches the individual constant", () => {
    expect(STAT_CATEGORIES.utility).toBe(STAT_CATEGORY_UTILITY);
  });

  it("STAT_CATEGORIES has exactly 5 entries — no accidental additions or omissions", () => {
    expect(Object.keys(STAT_CATEGORIES)).toHaveLength(5);
  });
});
