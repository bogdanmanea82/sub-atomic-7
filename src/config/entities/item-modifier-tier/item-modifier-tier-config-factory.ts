// src/config/entities/item-modifier-tier/item-modifier-tier-config-factory.ts
// Factory for ItemModifierTier entity configuration.
//
// Tiers are a subordinate entity to ItemModifier — no independent routes.
// The only item-specific field is modifier_id (FK back to item_modifier).
// All five progression fields come from the shared MODIFIER_TIERS_FIELDS molecule:
// tier_index, min_value, max_value, level_req, spawn_weight.
//
// Future tier configs (EnemyModifierTier, etc.) follow the same pattern —
// swap in their own parent FK and spread the same MODIFIER_TIERS_FIELDS.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig } from "../../types";
import { ID_FIELD_ATOM } from "../../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS } from "../../universal/molecules";
import { MODIFIER_TIERS_FIELDS } from "../../molecules/modifier";

export class ItemModifierTierConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "ItemModifierTier";
  }

  protected getDisplayName(): string {
    return "Item Modifier Tier";
  }

  protected getPluralDisplayName(): string {
    return "Item Modifier Tiers";
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  /**
   * Override buildFields entirely — tiers have no standard name/description/is_active.
   *
   * Field order:
   *   id → modifier_id (item-specific FK) → tier progression (shared molecule) → audit
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
      ...MODIFIER_TIERS_FIELDS,
      ...AUDIT_FIELDS,
    ] as const;
  }
}

export const ITEM_MODIFIER_TIER_CONFIG = new ItemModifierTierConfigFactory().create();
