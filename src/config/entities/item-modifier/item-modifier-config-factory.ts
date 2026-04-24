// src/config/entities/item-modifier/item-modifier-config-factory.ts
// Factory for ItemModifier entity configuration.
//
// Composes shared modifier molecules (hierarchy, code, lifecycle) with
// ItemModifier-specific fields. This is the reference implementation — future
// modifier domain factories (EnemyModifier, ZoneModifier, etc.) follow the
// same composition pattern but swap in their own entity-specific fields.
//
// Refactored in Milestone 2:
//   Removed: semantic_cat (stat.category replaces this), calc_method and
//            value_type (superseded by combination_type + roll_shape)
//   Added:   target_stat_id (FK to Stat), combination_type, roll_shape,
//            value_min, value_max, modifier_group, display_template

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
  MODIFIER_CODE_FIELD_ATOM,
  MODIFIER_STATUS_FIELDS,
  MODIFIER_ARCHIVE_FIELDS,
} from "../../molecules/modifier";

export class ItemModifierConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "ItemModifier";
  }

  protected getDisplayName(): string {
    return "Item Modifier";
  }

  protected getPluralDisplayName(): string {
    return "Item Modifiers";
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  /**
   * Item-specific classification fields — the fields that vary between modifier
   * domain types. Hierarchy, code, and lifecycle come from shared molecules.
   */
  protected getEntitySpecificFields(): readonly FieldConfig[] {
    return [
      {
        type: "enum",
        name: "affix_type",
        label: "Affix Type",
        values: ["prefix", "suffix"],
        required: true,
        displayFormat: "select",
        listOrder: 20,
      },
      TARGET_STAT_ID_FIELD_ATOM,
      COMBINATION_TYPE_FIELD_ATOM,
      ROLL_SHAPE_FIELD_ATOM,
      MODIFIER_VALUE_MIN_FIELD_ATOM,
      MODIFIER_VALUE_MAX_FIELD_ATOM,
      MODIFIER_GROUP_FIELD_ATOM,
      DISPLAY_TEMPLATE_FIELD_ATOM,
    ] as const;
  }

  /**
   * Full field order:
   *   id → hierarchy (domain/subdomain/category/subcategory)
   *   → code → name → description
   *   → [item-specific fields]
   *   → lifecycle (is_active / archived_at / archived_reason)
   *   → audit (created_at / updated_at)
   */
  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      ...MODIFIER_HIERARCHY_FIELDS,
      MODIFIER_CODE_FIELD_ATOM,
      NAME_FIELD_ATOM,
      DESCRIPTION_FIELD_ATOM,
      ...this.getEntitySpecificFields(),
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

export const ITEM_MODIFIER_CONFIG = new ItemModifierConfigFactory().create();
