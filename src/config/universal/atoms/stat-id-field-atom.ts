// src/config/universal/atoms/stat-id-field-atom.ts
// FK reference to Stat — used by junction entities (CharacterStatBase).

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

export const STAT_ID_FIELD_ATOM = {
  name: "stat_id",
  type: "reference",
  label: "Stat",
  targetEntity: "Stat",
  targetTable: "stat",
  targetDisplayField: "name",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.hidden,
} as const;
