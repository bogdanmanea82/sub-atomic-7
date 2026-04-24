// src/config/universal/sub-atoms/roll-shapes.ts
// Whether the modifier rolls a single frozen value or carries a live min–max range.
//
//   scalar — one value is rolled and frozen at item generation (e.g. "+30% increased life")
//   range  — both min and max are preserved and used live per event (e.g. "adds 5–10 fire damage per hit")

export const ROLL_SHAPE_SCALAR = "scalar" as const;
export const ROLL_SHAPE_RANGE  = "range"  as const;

export const ROLL_SHAPES = {
  scalar: ROLL_SHAPE_SCALAR,
  range:  ROLL_SHAPE_RANGE,
} as const;

export type RollShape = typeof ROLL_SHAPES[keyof typeof ROLL_SHAPES];
