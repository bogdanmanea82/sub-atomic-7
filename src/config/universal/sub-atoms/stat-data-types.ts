// src/config/universal/sub-atoms/stat-data-types.ts
// How a stat's stored integer should be interpreted for calculation and display.
//   raw        — the integer is the final value (strength: 32, armor: 500)
//   percentage — the integer is a percentage (fire_resist: 40 = 40%)
//   multiplier — the integer is scaled by 100 (attack_speed: 110 = 1.1x)

export const STAT_DATA_TYPE_RAW        = "raw"        as const;
export const STAT_DATA_TYPE_PERCENTAGE = "percentage" as const;
export const STAT_DATA_TYPE_MULTIPLIER = "multiplier" as const;

export const STAT_DATA_TYPES = {
  raw:        STAT_DATA_TYPE_RAW,
  percentage: STAT_DATA_TYPE_PERCENTAGE,
  multiplier: STAT_DATA_TYPE_MULTIPLIER,
} as const;

export type StatDataType = typeof STAT_DATA_TYPES[keyof typeof STAT_DATA_TYPES];
