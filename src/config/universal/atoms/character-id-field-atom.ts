// src/config/universal/atoms/character-id-field-atom.ts
// FK reference to CharacterClass — used by junction entities (CharacterStatBase).

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

export const CHARACTER_ID_FIELD_ATOM = {
  name: "character_id",
  type: "reference",
  label: "Character Class",
  targetEntity: "CharacterClass",
  targetTable: "character_class",
  targetDisplayField: "name",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.hidden,
} as const;
