// src/config/entities/item-modifier-binding/item-modifier-binding-config-factory.ts
// Factory for ItemModifierBinding entity configuration.
// Bindings are subordinate to ItemModifier — no independent routes.
// Override buildFields() completely since bindings have their own field set.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig } from "../../types";
import { ID_FIELD_ATOM } from "../../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS } from "../../universal/molecules";

export class ItemModifierBindingConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "ItemModifierBinding";
  }

  protected getDisplayName(): string {
    return "Item Modifier Binding";
  }

  protected getPluralDisplayName(): string {
    return "Item Modifier Bindings";
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  /**
   * Override buildFields entirely — bindings have no standard name/description.
   * Fields: id, modifier_id, target_type, target_id, is_included,
   * weight_override, min/max_tier_index, level_req_override, is_active, audit.
   */
  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      {
        type: "reference",
        name: "modifier_id",
        label: "ItemModifier",
        targetEntity: "ItemModifier",
        targetTable: "item_modifier",
        targetDisplayField: "name",
        required: true,
        displayFormat: "hidden",
      },
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
      ...AUDIT_FIELDS,
    ] as const;
  }
}

export const ITEM_MODIFIER_BINDING_CONFIG = new ItemModifierBindingConfigFactory().create();
