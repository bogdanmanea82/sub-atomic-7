// src/config/universal/atoms/roll-shape-field-atom.ts
// Whether this modifier rolls a single frozen value (scalar) or a live range.

import { DISPLAY_FORMATS, FIELD_MARKERS, ROLL_SHAPES } from "../sub-atoms";

export const ROLL_SHAPE_FIELD_ATOM = {
  name: "roll_shape",
  type: "enum",
  label: "Roll Shape",
  values: [
    ROLL_SHAPES.scalar,
    ROLL_SHAPES.range,
  ] as const,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
} as const;
