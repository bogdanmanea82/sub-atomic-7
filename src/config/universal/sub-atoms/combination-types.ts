// src/config/universal/sub-atoms/combination-types.ts
// How a modifier's value combines with other modifiers of the same kind.
//
// PoE math: final = (base + Σflat) × (1 + Σincreased) × Πmore
//   flat      — added to base before any multipliers
//   increased — additive within their bucket, then that bucket multiplies base
//   more      — each one independently multiplies the running total

export const COMBINATION_TYPE_FLAT      = "flat"      as const;
export const COMBINATION_TYPE_INCREASED = "increased" as const;
export const COMBINATION_TYPE_MORE      = "more"      as const;

export const COMBINATION_TYPES = {
  flat:      COMBINATION_TYPE_FLAT,
  increased: COMBINATION_TYPE_INCREASED,
  more:      COMBINATION_TYPE_MORE,
} as const;

export type CombinationType = typeof COMBINATION_TYPES[keyof typeof COMBINATION_TYPES];
