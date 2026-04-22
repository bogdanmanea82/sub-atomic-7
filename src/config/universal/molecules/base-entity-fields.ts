// src/config/universal/molecules/base-entity-fields.ts
// Core non-FK, non-audit fields shared by all simple hierarchy entities.
//
// These three fields appear in every hierarchy entity (GameDomain, GameSubdomain,
// GameCategory, GameSubcategory) after the entity-specific FK / sort fields and
// before the audit timestamps.
//
// Modifier-type entities do NOT use this molecule — their is_active is grouped
// with archive fields inside MODIFIER_LIFECYCLE_FIELDS instead.

import { NAME_FIELD_ATOM, DESCRIPTION_FIELD_ATOM, IS_ACTIVE_FIELD_ATOM } from "../atoms";

export const BASE_ENTITY_FIELDS = [
  NAME_FIELD_ATOM,
  DESCRIPTION_FIELD_ATOM,
  IS_ACTIVE_FIELD_ATOM,
] as const;
