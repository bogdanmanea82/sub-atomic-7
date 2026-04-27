// src/config/entities/modifier/modifier-config-factory.ts
// Factory for the universal Modifier entity configuration.
//
// A Modifier is a reusable stat-altering effect that can be bound to any asset type
// (items, enemies, zones, spells, etc.) via asset-type-specific binding entities.
// The Modifier row itself carries no asset-specific semantics — those live on the
// binding (ItemModifierBinding, EnemyModifierBinding, etc.).
//
// Field composition:
//   id → hierarchy (domain/subdomain/category/subcategory)
//   → machine_name → name → description
//   → [modifier-domain fields: target_stat_id, combination_type, roll_shape,
//      value_min, value_max, modifier_group, display_template]
//   → lifecycle (is_active / archived_at / archived_reason)
//   → audit (created_at / updated_at)

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import {
  ID_FIELD_ATOM,
  NAME_FIELD_ATOM,
  DESCRIPTION_FIELD_ATOM,
  TARGET_STAT_ID_FIELD_ATOM,
  COMBINATION_TYPE_FIELD_ATOM,
  ROLL_SHAPE_FIELD_ATOM,
  MODIFIER_VALUE_MIN_FIELD_ATOM,
  MODIFIER_VALUE_MAX_FIELD_ATOM,
  MODIFIER_GROUP_FIELD_ATOM,
  DISPLAY_TEMPLATE_FIELD_ATOM,
} from "../../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS } from "../../universal/molecules";
import {
  MODIFIER_HIERARCHY_FIELDS,
  MODIFIER_MACHINE_NAME_FIELD_ATOM,
  MODIFIER_STATUS_FIELDS,
  MODIFIER_ARCHIVE_FIELDS,
} from "../../molecules/modifier";

export class ModifierConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "Modifier";
  }

  protected getDisplayName(): string {
    return "Modifier";
  }

  protected getPluralDisplayName(): string {
    return "Modifiers";
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      ...MODIFIER_HIERARCHY_FIELDS,
      MODIFIER_MACHINE_NAME_FIELD_ATOM,
      NAME_FIELD_ATOM,
      DESCRIPTION_FIELD_ATOM,
      TARGET_STAT_ID_FIELD_ATOM,
      COMBINATION_TYPE_FIELD_ATOM,
      ROLL_SHAPE_FIELD_ATOM,
      MODIFIER_VALUE_MIN_FIELD_ATOM,
      MODIFIER_VALUE_MAX_FIELD_ATOM,
      MODIFIER_GROUP_FIELD_ATOM,
      DISPLAY_TEMPLATE_FIELD_ATOM,
      ...MODIFIER_STATUS_FIELDS,
      ...MODIFIER_ARCHIVE_FIELDS,
      ...AUDIT_FIELDS,
    ] as const;
  }

  /**
   * Virtual form fields stripped before UPDATE:
   *   tiers_json    — serialised tier array submitted by browser
   *   tiers         — deserialized counterpart (defensive)
   *   status_action — radio value translated to is_active by applyStatusAction()
   *   status_reason — textarea value consumed by applyStatusAction()
   */
  protected override getNonColumnKeys(): readonly string[] {
    return ["tiers_json", "tiers", "status_action", "status_reason"];
  }

  protected override getRelationships(): readonly RelationshipConfig[] {
    return [
      {
        name: "gameDomain",
        type: "belongsTo",
        targetEntity: "GameDomain",
        foreignKey: "game_domain_id",
        inverseRelationship: "modifiers",
      },
      {
        name: "gameSubdomain",
        type: "belongsTo",
        targetEntity: "GameSubdomain",
        foreignKey: "game_subdomain_id",
        inverseRelationship: "modifiers",
      },
      {
        name: "gameCategory",
        type: "belongsTo",
        targetEntity: "GameCategory",
        foreignKey: "game_category_id",
        inverseRelationship: "modifiers",
      },
      {
        name: "gameSubcategory",
        type: "belongsTo",
        targetEntity: "GameSubcategory",
        foreignKey: "game_subcategory_id",
        inverseRelationship: "modifiers",
      },
    ];
  }
}

export const MODIFIER_CONFIG = new ModifierConfigFactory().create();
