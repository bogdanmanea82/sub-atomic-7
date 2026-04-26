// src/config/molecules/modifier/code-field.ts
// Machine-readable identifier field shared by all modifier domain types.
//
// The machine_name is a lowercase_snake_case slug (e.g., "str_req", "fire_res", "bleed_chance").
// Extracted so ItemModifier, EnemyModifier, ZoneModifier etc. share identical
// machine_name field semantics — same pattern, same length constraints, same display format.

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
