// src/config/molecules/modifier/binding-fields.ts
// Binding fields shared by all modifier binding sub-entities.
// Every modifier type (Modifier, EnemyModifier, …) uses the same binding shape.
// ModifierBindingConfigFactory spreads these after its own parent FK field.

export const MODIFIER_BINDING_FIELDS = [
  {
    type: "enum",
    name: "target_type",
    label: "Target Type",
    values: ["category", "subcategory"] as const,
    required: true,
    displayFormat: "select",
  },
  {
    type: "reference",
    name: "target_id",
    label: "Target",
    targetEntity: "GameCategory",
    targetTable: "game_category",
    targetDisplayField: "name",
    required: true,
    displayFormat: "select",
  },
  {
    type: "boolean",
    name: "is_included",
    label: "Included",
    defaultValue: true,
    required: true,
    displayFormat: "toggle",
  },
  {
    type: "integer",
    name: "weight_override",
    label: "Weight Override",
    min: 0,
    max: 10000,
    required: false,
    displayFormat: "number",
  },
  {
    type: "integer",
    name: "min_tier_index",
    label: "Min Tier",
    min: 0,
    max: 999,
    required: false,
    displayFormat: "number",
  },
  {
    type: "integer",
    name: "max_tier_index",
    label: "Max Tier",
    min: 0,
    max: 999,
    required: false,
    displayFormat: "number",
  },
  {
    type: "integer",
    name: "level_req_override",
    label: "Level Req Override",
    min: 1,
    max: 99,
    required: false,
    displayFormat: "number",
  },
  {
    type: "boolean",
    name: "is_active",
    label: "Active",
    defaultValue: true,
    required: true,
    displayFormat: "toggle",
  },
] as const;
