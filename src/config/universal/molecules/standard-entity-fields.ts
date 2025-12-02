// src/config/universal/molecules/standard-entity-fields.ts
// Standard fields present on all entities

import {
  DESCRIPTION_FIELD_ATOM,
  ID_FIELD_ATOM,
  IS_ACTIVE_FIELD_ATOM,
  NAME_FIELD_ATOM,
} from "../atoms";

/**
 * Standard entity fields molecule.
 * Every entity includes these core fields.
 */

export const STANDARD_ENTITY_FIELDS = [
  ID_FIELD_ATOM,
  NAME_FIELD_ATOM,
  DESCRIPTION_FIELD_ATOM,
  IS_ACTIVE_FIELD_ATOM,
] as const;
