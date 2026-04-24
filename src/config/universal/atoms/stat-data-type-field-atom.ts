// src/config/universal/atoms/stat-data-type-field-atom.ts
// How the stat's stored integer is interpreted: raw, percentage, or multiplier.

import { DISPLAY_FORMATS, FIELD_MARKERS, STAT_DATA_TYPES } from "../sub-atoms";

export const STAT_DATA_TYPE_FIELD_ATOM = {
  name: "data_type",
  type: "enum",
  label: "Data Type",
  values: [
    STAT_DATA_TYPES.raw,
    STAT_DATA_TYPES.percentage,
    STAT_DATA_TYPES.multiplier,
  ] as const,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
} as const;
