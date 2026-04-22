// tests/view-service/sub-atoms/formatters/format-binding-overrides.test.ts
// Verifies the tier range display logic — the four null-combination branches
// determine whether the label reads "All tiers", "Tier N+", "Tiers 0–N", or "Tiers M–N".

import { describe, it, expect } from "bun:test";
import { formatBindingOverrides } from "../../../../src/view-service/sub-atoms/formatters/format-binding-overrides";

describe("formatBindingOverrides", () => {
  // ── tierRange combinations ─────────────────────────────────────────────────

  it("returns 'All tiers' when both min_tier_index and max_tier_index are null", () => {
    const result = formatBindingOverrides({ min_tier_index: null, max_tier_index: null });
    expect(result.tierRange).toBe("All tiers");
  });

  it("returns 'Tiers M–N' when both bounds are set", () => {
    const result = formatBindingOverrides({ min_tier_index: 1, max_tier_index: 3 });
    expect(result.tierRange).toBe("Tiers 1–3");
  });

  it("returns 'Tier N+' when only min_tier_index is set", () => {
    const result = formatBindingOverrides({ min_tier_index: 2, max_tier_index: null });
    expect(result.tierRange).toBe("Tier 2+");
  });

  it("returns 'Tiers 0–N' when only max_tier_index is set", () => {
    const result = formatBindingOverrides({ min_tier_index: null, max_tier_index: 4 });
    expect(result.tierRange).toBe("Tiers 0–4");
  });

  // ── minTier / maxTier (Bindings panel — separate columns) ──────────────────

  it("returns string value of min_tier_index when set", () => {
    const result = formatBindingOverrides({ min_tier_index: 2 });
    expect(result.minTier).toBe("2");
  });

  it("returns 'All tiers' for minTier when min_tier_index is null", () => {
    const result = formatBindingOverrides({ min_tier_index: null });
    expect(result.minTier).toBe("All tiers");
  });

  it("returns string value of max_tier_index when set", () => {
    const result = formatBindingOverrides({ max_tier_index: 5 });
    expect(result.maxTier).toBe("5");
  });

  it("returns 'All tiers' for maxTier when max_tier_index is null", () => {
    const result = formatBindingOverrides({ max_tier_index: null });
    expect(result.maxTier).toBe("All tiers");
  });

  // ── weightOverride ────────────────────────────────────────────────────────

  it("returns 'Global default' when weight_override is null", () => {
    const result = formatBindingOverrides({ weight_override: null });
    expect(result.weightOverride).toBe("Global default");
  });

  it("returns the string form of weight_override when set", () => {
    const result = formatBindingOverrides({ weight_override: 75 });
    expect(result.weightOverride).toBe("75");
  });

  // ── levelReqOverride ──────────────────────────────────────────────────────

  it("returns 'Per tier default' when level_req_override is null", () => {
    const result = formatBindingOverrides({ level_req_override: null });
    expect(result.levelReqOverride).toBe("Per tier default");
  });

  it("returns the string form of level_req_override when set", () => {
    const result = formatBindingOverrides({ level_req_override: 10 });
    expect(result.levelReqOverride).toBe("10");
  });

  // ── Missing keys treated as null ──────────────────────────────────────────
  // The function reads b["key"] which returns undefined for absent keys;
  // the null-check `!= null` must handle undefined too (since undefined != null is false).

  it("treats absent keys the same as null", () => {
    const result = formatBindingOverrides({});
    expect(result.tierRange).toBe("All tiers");
    expect(result.weightOverride).toBe("Global default");
    expect(result.levelReqOverride).toBe("Per tier default");
  });
});
