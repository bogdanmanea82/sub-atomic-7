// src/view-service/sub-atoms/formatters/format-binding-overrides.ts
// Formats the five display strings shared by the Bindings panel and Assignments panel.
//
// Both panels read the same four DB fields (weight_override, min_tier_index,
// max_tier_index, level_req_override) but present tiers differently:
//   • Bindings panel  — minTier / maxTier as separate columns
//   • Assignments panel — tierRange as a single combined string
//
// Returning all five lets each caller destructure only what it needs.

export type BindingOverrideDisplay = {
  readonly weightOverride: string;
  readonly minTier: string;
  readonly maxTier: string;
  readonly tierRange: string;
  readonly levelReqOverride: string;
};

export function formatBindingOverrides(b: Record<string, unknown>): BindingOverrideDisplay {
  const minTierRaw = b["min_tier_index"];
  const maxTierRaw = b["max_tier_index"];

  let tierRange = "All tiers";
  if (minTierRaw != null && maxTierRaw != null) {
    tierRange = `Tiers ${minTierRaw}–${maxTierRaw}`;
  } else if (minTierRaw != null) {
    tierRange = `Tier ${minTierRaw}+`;
  } else if (maxTierRaw != null) {
    tierRange = `Tiers 0–${maxTierRaw}`;
  }

  return {
    weightOverride: b["weight_override"] != null ? String(b["weight_override"]) : "Global default",
    minTier: minTierRaw != null ? String(minTierRaw) : "All tiers",
    maxTier: maxTierRaw != null ? String(maxTierRaw) : "All tiers",
    tierRange,
    levelReqOverride: b["level_req_override"] != null ? String(b["level_req_override"]) : "Per tier default",
  };
}
