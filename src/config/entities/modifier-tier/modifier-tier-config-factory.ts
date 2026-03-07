// src/config/entities/modifier-tier/modifier-tier-config-factory.ts
// Factory for ModifierTier entity configuration.
// Tiers are subordinate to Modifier — no independent routes.
// Override buildFields() completely since tiers don't have name/description/is_active.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig } from "../../types";
import { ID_FIELD_ATOM } from "../../universal/atoms";
import { AUDIT_FIELDS } from "../../universal/molecules";

export class ModifierTierConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "ModifierTier";
  }

  protected getDisplayName(): string {
    return "Modifier Tier";
  }

  protected getPluralDisplayName(): string {
    return "Modifier Tiers";
  }

  protected getPermissions(): PermissionConfig {
    return {
      create: "admin",
      read: "public",
      update: "admin",
      delete: "admin",
    };
  }

  /**
   * Override buildFields entirely — tiers have no standard name/description/is_active.
   * Fields: id, modifier_id (FK), tier_index, min_value, max_value, level_req, spawn_weight, audit.
   */
  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      {
        type: "reference",
        name: "modifier_id",
        label: "Modifier",
        targetEntity: "Modifier",
        targetTable: "modifier",
        targetDisplayField: "name",
        required: true,
        displayFormat: "hidden",
      },
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
      ...AUDIT_FIELDS,
    ] as const;
  }
}

export const MODIFIER_TIER_CONFIG = new ModifierTierConfigFactory().create();
