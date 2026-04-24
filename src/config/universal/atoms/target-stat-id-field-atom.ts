// src/config/universal/atoms/target-stat-id-field-atom.ts
// FK into the stat table — which numeric dimension this modifier affects.

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

export const TARGET_STAT_ID_FIELD_ATOM = {
  name: "target_stat_id",
  type: "reference",
  label: "Target Stat",
  targetEntity: "Stat",
  targetTable: "stat",
  targetDisplayField: "name",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
} as const;
