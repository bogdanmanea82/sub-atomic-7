// src/config/molecules/modifier/tiers-fields.ts
// Tier progression fields shared by all modifier tier sub-entities.
//
// Two exports:
//   MODIFIER_TIERS_FIELDS   — DB/validation config (L0 → L1 model + L2 service)
//   MODIFIER_TIER_FORM_META — browser form widget config (L0 → L4 view service → L6)
//
// Each domain modifier tier config (ItemModifierTier, EnemyModifierTier, etc.)
// spreads MODIFIER_TIERS_FIELDS and adds only its own FK.
// Domains without tiers omit this molecule entirely.

export const MODIFIER_TIERS_FIELDS = [
  {
    type: "integer",
    name: "tier_index",
    label: "Tier",
    min: 0,
    max: 999,
    required: true,
    displayFormat: "number",
  },
  {
    type: "decimal",
    name: "min_value",
    label: "Min Value",
    precision: 12,
    scale: 4,
    required: true,
    displayFormat: "number",
  },
  {
    type: "decimal",
    name: "max_value",
    label: "Max Value",
    precision: 12,
    scale: 4,
    required: true,
    displayFormat: "number",
  },
  {
    type: "integer",
    name: "level_req",
    label: "Level Req",
    min: 1,
    max: 99,
    defaultValue: 1,
    required: true,
    displayFormat: "number",
  },
  {
    type: "integer",
    name: "spawn_weight",
    label: "Spawn Weight",
    min: 0,
    max: 10000,
    defaultValue: 100,
    required: true,
    displayFormat: "number",
  },
] as const;

/**
 * Browser form widget configuration for tier row inputs.
 * Tells the browser JS how to render each editable tier field (type, range, step).
 * tier_index is intentionally absent — it is managed by the browser, not directly edited.
 *
 * field constraints mirror MODIFIER_TIERS_FIELDS:
 *   min_value / max_value: decimal (step 0.0001 = 4 d.p.)
 *   level_req:             integer 1–99
 *   spawn_weight:          integer 0–10000
 */
export const MODIFIER_TIER_FORM_META = [
  { name: "min_value",    label: "Min Value",    inputType: "number", step: "0.0001" },
  { name: "max_value",    label: "Max Value",    inputType: "number", step: "0.0001" },
  { name: "level_req",    label: "Level Req",    inputType: "number", min: 1,  max: 99    },
  { name: "spawn_weight", label: "Spawn Weight", inputType: "number", min: 0,  max: 10000 },
] as const;
