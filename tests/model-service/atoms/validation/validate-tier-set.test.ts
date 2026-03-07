// tests/model-service/atoms/validation/validate-tier-set.test.ts
import { describe, it, expect } from "bun:test";
import { validateTierSet, type TierInput } from "../../../../src/model-service/atoms/validation/validate-tier-set";

const tier = (overrides: Partial<TierInput> & { tier_index: number }): TierInput => ({
  min_value: 1,
  max_value: 5,
  level_req: 1,
  spawn_weight: 100,
  ...overrides,
});

describe("validateTierSet", () => {
  // ── Valid sets ──────────────────────────────────────────────────────────
  it("accepts a single tier", () => {
    const result = validateTierSet([tier({ tier_index: 0 })]);
    expect(result.valid).toBe(true);
  });

  it("accepts 3 progressive tiers", () => {
    const result = validateTierSet([
      tier({ tier_index: 0, min_value: 1, max_value: 5, level_req: 1, spawn_weight: 100 }),
      tier({ tier_index: 1, min_value: 3, max_value: 8, level_req: 5, spawn_weight: 80 }),
      tier({ tier_index: 2, min_value: 5, max_value: 12, level_req: 10, spawn_weight: 50 }),
    ]);
    expect(result.valid).toBe(true);
  });

  it("accepts tiers with equal min_value (non-decreasing)", () => {
    const result = validateTierSet([
      tier({ tier_index: 0, min_value: 5, level_req: 1, spawn_weight: 100 }),
      tier({ tier_index: 1, min_value: 5, level_req: 2, spawn_weight: 100 }),
    ]);
    expect(result.valid).toBe(true);
  });

  it("accepts tiers with equal spawn_weight (non-increasing)", () => {
    const result = validateTierSet([
      tier({ tier_index: 0, level_req: 1, spawn_weight: 100 }),
      tier({ tier_index: 1, level_req: 2, spawn_weight: 100 }),
    ]);
    expect(result.valid).toBe(true);
  });

  it("accepts tiers passed out of order (sorted by tier_index internally)", () => {
    const result = validateTierSet([
      tier({ tier_index: 2, min_value: 5, max_value: 12, level_req: 10, spawn_weight: 50 }),
      tier({ tier_index: 0, min_value: 1, max_value: 5, level_req: 1, spawn_weight: 100 }),
      tier({ tier_index: 1, min_value: 3, max_value: 8, level_req: 5, spawn_weight: 80 }),
    ]);
    expect(result.valid).toBe(true);
  });

  // ── Empty set ───────────────────────────────────────────────────────────
  it("rejects empty tier array", () => {
    const result = validateTierSet([]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors["tiers"]).toContain("At least one tier");
    }
  });

  // ── Gapless index ───────────────────────────────────────────────────────
  it("rejects gap in tier indexes (0, 2 — missing 1)", () => {
    const result = validateTierSet([
      tier({ tier_index: 0, level_req: 1 }),
      tier({ tier_index: 2, level_req: 5 }),
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors["tiers"]).toContain("gapless");
    }
  });

  it("rejects tier starting at index 1 instead of 0", () => {
    const result = validateTierSet([
      tier({ tier_index: 1 }),
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors["tiers"]).toContain("gapless");
    }
  });

  // ── max_value >= min_value ──────────────────────────────────────────────
  it("rejects tier where max_value < min_value", () => {
    const result = validateTierSet([
      tier({ tier_index: 0, min_value: 10, max_value: 5 }),
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors["tier_0_max_value"]).toContain("Max Value must be >= Min Value");
    }
  });

  // ── level_req strictly increasing ───────────────────────────────────────
  it("rejects equal level_req across tiers", () => {
    const result = validateTierSet([
      tier({ tier_index: 0, level_req: 5, spawn_weight: 100 }),
      tier({ tier_index: 1, level_req: 5, spawn_weight: 100 }),
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors["tier_1_level_req"]).toContain("must be greater than");
    }
  });

  it("rejects decreasing level_req", () => {
    const result = validateTierSet([
      tier({ tier_index: 0, level_req: 10, spawn_weight: 100 }),
      tier({ tier_index: 1, level_req: 5, spawn_weight: 100 }),
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors["tier_1_level_req"]).toContain("must be greater than");
    }
  });

  // ── min_value non-decreasing ────────────────────────────────────────────
  it("rejects decreasing min_value across tiers", () => {
    const result = validateTierSet([
      tier({ tier_index: 0, min_value: 10, level_req: 1, spawn_weight: 100 }),
      tier({ tier_index: 1, min_value: 5, level_req: 5, spawn_weight: 100 }),
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors["tier_1_min_value"]).toContain("must be >=");
    }
  });

  // ── spawn_weight non-increasing ─────────────────────────────────────────
  it("rejects increasing spawn_weight across tiers", () => {
    const result = validateTierSet([
      tier({ tier_index: 0, level_req: 1, spawn_weight: 50 }),
      tier({ tier_index: 1, level_req: 5, spawn_weight: 100 }),
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors["tier_1_spawn_weight"]).toContain("must be <=");
    }
  });

  // ── Multiple errors ─────────────────────────────────────────────────────
  it("collects multiple errors from different tiers", () => {
    const result = validateTierSet([
      tier({ tier_index: 0, min_value: 10, max_value: 5, level_req: 10, spawn_weight: 50 }),
      tier({ tier_index: 1, min_value: 5, max_value: 20, level_req: 5, spawn_weight: 100 }),
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      // Tier 0: max < min
      expect(result.errors["tier_0_max_value"]).toBeDefined();
      // Tier 1: level_req not increasing, min_value decreasing, spawn_weight increasing
      expect(result.errors["tier_1_level_req"]).toBeDefined();
      expect(result.errors["tier_1_min_value"]).toBeDefined();
      expect(result.errors["tier_1_spawn_weight"]).toBeDefined();
    }
  });
});
