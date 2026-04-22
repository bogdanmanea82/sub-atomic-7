// src/config/entities/item-modifier/item-modifier-config-factory.ts
// Factory for ItemModifier entity configuration.
//
// Composes shared modifier molecules (hierarchy, code, lifecycle) with
// ItemModifier-specific classification enums (affix_type, semantic_cat,
// value_type, calc_method). This is the reference implementation — future
// modifier domain factories (EnemyModifier, ZoneModifier, etc.) follow the
// same composition pattern but swap in their own entity-specific fields.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import {
  ID_FIELD_ATOM,
  NAME_FIELD_ATOM,
  DESCRIPTION_FIELD_ATOM,
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
   * Item-specific classification enums — the fields that vary between modifier
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
      {
        type: "enum",
        name: "semantic_cat",
        label: "Semantic Category",
        values: ["offensive", "defensive", "utility", "resource"],
        required: true,
        displayFormat: "select",
        listOrder: 21,
      },
      {
        type: "enum",
        name: "value_type",
        label: "Value Type",
        values: ["flat", "increased", "more", "between"],
        required: true,
        displayFormat: "select",
        listOrder: 22,
      },
      {
        type: "enum",
        name: "calc_method",
        label: "Calculation Method",
        values: ["additive", "multiplicative"],
        required: true,
        displayFormat: "select",
        listOrder: 23,
      },
    ] as const;
  }

  /**
   * Full field order:
   *   id → hierarchy (domain/subdomain/category/subcategory)
   *   → code → name → description
   *   → [item-specific enums]
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
   * Virtual form fields that must be stripped before the UPDATE query:
   *   tiers_json    — serialised tier array submitted by the browser
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
