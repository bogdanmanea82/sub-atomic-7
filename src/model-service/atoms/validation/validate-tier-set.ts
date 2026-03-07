// src/model-service/atoms/validation/validate-tier-set.ts
// Cross-row validation for an array of tier inputs.
// Enforces ordering constraints that can't be expressed per-field.

export type TierInput = {
  readonly tier_index: number;
  readonly min_value: number;
  readonly max_value: number;
  readonly level_req: number;
  readonly spawn_weight: number;
};

export type TierSetValidationResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly errors: Record<string, string> };

export function validateTierSet(tiers: readonly TierInput[]): TierSetValidationResult {
  const errors: Record<string, string> = {};

  // At least 1 tier required
  if (tiers.length === 0) {
    errors["tiers"] = "At least one tier is required";
    return { valid: false, errors };
  }

  // Sort by tier_index for ordering checks
  const sorted = [...tiers].sort((a, b) => a.tier_index - b.tier_index);

  // Check gapless indexes from 0
  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i]!;
    if (tier.tier_index !== i) {
      errors["tiers"] = `Tier indexes must be gapless starting from 0. Expected index ${i} but found ${tier.tier_index}`;
      return { valid: false, errors };
    }
  }

  // Per-tier and cross-tier checks
  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i]!;
    const prefix = `tier_${i}`;

    // max_value >= min_value
    if (tier.max_value < tier.min_value) {
      errors[`${prefix}_max_value`] = `Tier ${i}: Max Value must be >= Min Value`;
    }

    if (i > 0) {
      const prev = sorted[i - 1]!;

      // level_req strictly increasing
      if (tier.level_req <= prev.level_req) {
        errors[`${prefix}_level_req`] = `Tier ${i}: Level Req must be greater than Tier ${i - 1} (${prev.level_req})`;
      }

      // min_value non-decreasing
      if (tier.min_value < prev.min_value) {
        errors[`${prefix}_min_value`] = `Tier ${i}: Min Value must be >= Tier ${i - 1} (${prev.min_value})`;
      }

      // spawn_weight non-increasing
      if (tier.spawn_weight > prev.spawn_weight) {
        errors[`${prefix}_spawn_weight`] = `Tier ${i}: Spawn Weight must be <= Tier ${i - 1} (${prev.spawn_weight})`;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}
