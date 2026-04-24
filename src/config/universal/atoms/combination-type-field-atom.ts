// src/config/universal/atoms/combination-type-field-atom.ts
// Which math bucket this modifier belongs to (flat / increased / more).

import { DISPLAY_FORMATS, FIELD_MARKERS, COMBINATION_TYPES } from "../sub-atoms";

export const COMBINATION_TYPE_FIELD_ATOM = {
  name: "combination_type",
  type: "enum",
  label: "Combination Type",
  values: [
    COMBINATION_TYPES.flat,
    COMBINATION_TYPES.increased,
    COMBINATION_TYPES.more,
  ] as const,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
} as const;
