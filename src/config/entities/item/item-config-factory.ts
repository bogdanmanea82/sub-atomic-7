// src/config/entities/item/item-config-factory.ts
// Factory for Item entity configuration.
//
// Item is a template-level entity: each row represents one base item type
// (e.g., Heavy Belt, 1H Sword). The game engine reads templates to generate
// rolled instances at runtime. Rarity, affixes, and instance state are
// runtime concerns — not stored here.
//
// Slot semantics come from the hierarchy position (subcategory). Items don't
// carry a slot field; the hierarchy encodes the equipment slot implicitly.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import {
  ID_FIELD_ATOM,
  MACHINE_NAME_FIELD_ATOM,
  NAME_FIELD_ATOM,
  DESCRIPTION_FIELD_ATOM,
  IS_ACTIVE_FIELD_ATOM,
} from "../../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS, ARCHIVE_FIELDS } from "../../universal/molecules";
import { MODIFIER_HIERARCHY_FIELDS } from "../../molecules/modifier";

export class ItemConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "Item";
  }

  protected getDisplayName(): string {
    return "Item";
  }

  protected getPluralDisplayName(): string {
    return "Items";
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      ...MODIFIER_HIERARCHY_FIELDS,
      MACHINE_NAME_FIELD_ATOM,
      NAME_FIELD_ATOM,
      DESCRIPTION_FIELD_ATOM,
      IS_ACTIVE_FIELD_ATOM,
      ...ARCHIVE_FIELDS,
      ...AUDIT_FIELDS,
    ] as const;
  }

  protected override getNonColumnKeys(): readonly string[] {
    return ["stat_sheet_json", "status_action", "status_reason"];
  }

  protected override getRelationships(): readonly RelationshipConfig[] {
    return [
      {
        name: "gameDomain",
        type: "belongsTo",
        targetEntity: "GameDomain",
        foreignKey: "game_domain_id",
        inverseRelationship: "items",
      },
      {
        name: "gameSubdomain",
        type: "belongsTo",
        targetEntity: "GameSubdomain",
        foreignKey: "game_subdomain_id",
        inverseRelationship: "items",
      },
      {
        name: "gameCategory",
        type: "belongsTo",
        targetEntity: "GameCategory",
        foreignKey: "game_category_id",
        inverseRelationship: "items",
      },
      {
        name: "gameSubcategory",
        type: "belongsTo",
        targetEntity: "GameSubcategory",
        foreignKey: "game_subcategory_id",
        inverseRelationship: "items",
      },
    ];
  }
}

export const ITEM_CONFIG = new ItemConfigFactory().create();
