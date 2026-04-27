// src/model-service/sub-atoms/tiers/tier-inputs-from-tiers.ts
// Strips DB-only fields (id, modifier_id, timestamps) from deserialized tier records,
// leaving just the five progression fields needed for validation and re-insertion.
//
// Generic over any tier record type — any struct with the five fields qualifies,
// so ModifierTier (and any future tier sub-types) satisfy HasTierFields without
// explicit implementation.

import type { TierInput } from "../../atoms/validation/validate-tier-set";

/** Structural constraint — any tier DB record with these five fields qualifies. */
export type HasTierFields = {
  readonly tier_index: number;
  readonly min_value: number;
  readonly max_value: number;
  readonly level_req: number;
  readonly spawn_weight: number;
};

export function tierInputsFromTiers<T extends HasTierFields>(tiers: readonly T[]): TierInput[] {
  return tiers.map(({ tier_index, min_value, max_value, level_req, spawn_weight }) => ({
    tier_index,
    min_value,
    max_value,
    level_req,
    spawn_weight,
  }));
}
