// src/config/molecules/modifier/hierarchy-fields.ts
// The four FK fields connecting any modifier type to the full game hierarchy.
// Composed from existing universal ref-field atoms.
//
// Every modifier domain type (ItemModifier, EnemyModifier, ZoneModifier, etc.)
// spreads this molecule in its buildFields() — one import, four fields.

import {
  GAME_DOMAIN_REF_FIELD_ATOM,
  GAME_SUBDOMAIN_REF_FIELD_ATOM,
  GAME_CATEGORY_REF_FIELD_ATOM,
  GAME_SUBCATEGORY_REF_FIELD_ATOM,
} from "../../universal/atoms";

export const MODIFIER_HIERARCHY_FIELDS = [
  GAME_DOMAIN_REF_FIELD_ATOM,
  GAME_SUBDOMAIN_REF_FIELD_ATOM,
  GAME_CATEGORY_REF_FIELD_ATOM,
  GAME_SUBCATEGORY_REF_FIELD_ATOM,
] as const;
