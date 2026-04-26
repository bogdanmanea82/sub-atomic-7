// src/config/entities/item-stat-base/item-stat-base-config-factory.ts
// Factory for ItemStatBase junction entity configuration.
//
// Junction between Item and Stat: one row per (item, stat) pair, storing
// implicit base values and requirements for each item template.
//
// Mirrors the shape of CharacterStatBase extended with combination_type,
// establishing the uniform junction pattern for all asset stat-base tables.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig } from "../../types";
import {
  ID_FIELD_ATOM,
  ITEM_ID_FIELD_ATOM,
  STAT_ID_FIELD_ATOM,
  COMBINATION_TYPE_FIELD_ATOM,
} from "../../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS } from "../../universal/molecules";
import { DISPLAY_FORMATS, FIELD_MARKERS, INTEGER_CONSTRAINTS } from "../../universal/sub-atoms";

export class ItemStatBaseConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "ItemStatBase";
  }

  protected getDisplayName(): string {
    return "Item Stat Base";
  }

  protected getPluralDisplayName(): string {
    return "Item Stat Bases";
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      ITEM_ID_FIELD_ATOM,
      STAT_ID_FIELD_ATOM,
      COMBINATION_TYPE_FIELD_ATOM,
      {
        name: "base_value",
        type: "integer",
        label: "Base Value",
        ...INTEGER_CONSTRAINTS.signed,
        ...FIELD_MARKERS.required,
        ...DISPLAY_FORMATS.number,
      },
      ...AUDIT_FIELDS,
    ] as const;
  }
}

export const ITEM_STAT_BASE_CONFIG = new ItemStatBaseConfigFactory().create();
