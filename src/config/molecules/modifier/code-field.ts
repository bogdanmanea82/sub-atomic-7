// src/config/molecules/modifier/code-field.ts
// Machine-readable identifier field shared by all modifier domain types.
//
// The machine_name is a lowercase_snake_case slug (e.g., "str_req", "fire_res", "bleed_chance").
// Used by the universal Modifier entity; asset-type-specific binding entities (ItemModifierBinding,
// EnemyModifierBinding, etc.) reference the same modifier row without duplicating machine_name.

import type { FieldConfig } from "../../types";

export const MODIFIER_MACHINE_NAME_FIELD_ATOM: FieldConfig = {
  type: "string",
  name: "machine_name",
  label: "Machine Name",
  minLength: 3,
  maxLength: 100,
  pattern: "^[a-z0-9_]+$",
  required: true,
  displayFormat: "text",
  listOrder: 1,
} as const;
