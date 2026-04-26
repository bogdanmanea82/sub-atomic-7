// src/config/molecules/modifier/index.ts
// Shared field molecules for all modifier domain types.
//
// Usage pattern in a domain modifier config factory:
//   import { MODIFIER_HIERARCHY_FIELDS, MODIFIER_STATUS_FIELDS, MODIFIER_ARCHIVE_FIELDS, ... } from "../../molecules/modifier";
//
// Compose with domain-specific fields to build a full modifier config.

export { MODIFIER_HIERARCHY_FIELDS } from "./hierarchy-fields";
export { MODIFIER_STATUS_FIELDS } from "./status-fields";
export { MODIFIER_ARCHIVE_FIELDS } from "./archive-fields";
export { MODIFIER_MACHINE_NAME_FIELD_ATOM } from "./code-field";
export { MODIFIER_TIERS_FIELDS, MODIFIER_TIER_FORM_META } from "./tiers-fields";
export { MODIFIER_BINDING_FIELDS } from "./binding-fields";
