// src/config/universal/atoms/game-domain-ref-field-atom.ts
// Reference field atom — links an entity to its parent GameDomain via foreign key.

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

/**
 * The game_domain_id reference field.
 * Required foreign key rendered as a <select> dropdown in forms.
 */
export const GAME_DOMAIN_REF_FIELD_ATOM = {
  name: "game_domain_id",
  type: "reference",
  label: "Game Domain",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
  targetEntity: "GameDomain",
  targetTable: "game_domain",
  targetDisplayField: "name",
} as const;
