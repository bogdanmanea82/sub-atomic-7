// src/config/universal/atoms/game-subcategory-ref-field-atom.ts
// Reference field atom — links an entity to its parent GameSubcategory via foreign key.

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

/**
 * The game_subcategory_id reference field.
 * Required foreign key rendered as a <select> dropdown in forms.
 */
export const GAME_SUBCATEGORY_REF_FIELD_ATOM = {
  name: "game_subcategory_id",
  type: "reference",
  label: "Game Subcategory",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
  targetEntity: "GameSubcategory",
  targetTable: "game_subcategory",
  targetDisplayField: "name",
} as const;
