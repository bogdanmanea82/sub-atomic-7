// src/config/universal/atoms/game-category-ref-field-atom.ts
// Reference field atom — links an entity to its parent GameCategory via foreign key.

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

/**
 * The game_category_id reference field.
 * Required foreign key rendered as a <select> dropdown in forms.
 */
export const GAME_CATEGORY_REF_FIELD_ATOM = {
  name: "game_category_id",
  type: "reference",
  label: "Game Category",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
  targetEntity: "GameCategory",
  targetTable: "game_category",
  targetDisplayField: "name",
} as const;
