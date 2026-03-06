// src/config/universal/atoms/game-subdomain-ref-field-atom.ts
// Reference field atom — links an entity to its parent GameSubdomain via foreign key.

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

/**
 * The game_subdomain_id reference field.
 * Required foreign key rendered as a <select> dropdown in forms.
 */
export const GAME_SUBDOMAIN_REF_FIELD_ATOM = {
  name: "game_subdomain_id",
  type: "reference",
  label: "Game Subdomain",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
  targetEntity: "GameSubdomain",
  targetTable: "game_subdomain",
  targetDisplayField: "name",
} as const;
