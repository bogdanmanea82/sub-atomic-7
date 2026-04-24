// src/config/universal/atoms/character-id-field-atom.ts
// FK reference to Character — used by junction entities (CharacterStatBase).

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

export const CHARACTER_ID_FIELD_ATOM = {
  name: "character_id",
  type: "reference",
  label: "Character",
  targetEntity: "Character",
  targetTable: "character",
  targetDisplayField: "name",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.hidden,
} as const;
