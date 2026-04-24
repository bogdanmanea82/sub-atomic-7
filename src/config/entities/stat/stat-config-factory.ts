// src/config/entities/stat/stat-config-factory.ts
// Factory for Stat entity configuration.
//
// Stat is the authoritative registry of every numeric dimension in the game.
// Every other entity that references a numeric stat (Modifier, Character, Formula)
// does so by foreign key into this table, not by loose string.
//
// Fields:
//   machine_name  — stable snake_case identifier for programmatic dispatch
//   name          — human display name
//   data_type     — how the stored integer is interpreted (raw/percentage/multiplier)
//   value_min     — lowest valid value (signed — resistances can reach -100)
//   value_max     — highest valid value
//   default_value — starting value before any modifiers
//   category      — semantic grouping (attribute/resource/offensive/defensive/utility)

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig } from "../../types";
import {
  ID_FIELD_ATOM,
  MACHINE_NAME_FIELD_ATOM,
  NAME_FIELD_ATOM,
  DESCRIPTION_FIELD_ATOM,
  STAT_DATA_TYPE_FIELD_ATOM,
  STAT_VALUE_MIN_FIELD_ATOM,
  STAT_VALUE_MAX_FIELD_ATOM,
  STAT_DEFAULT_VALUE_FIELD_ATOM,
} from "../../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS } from "../../universal/molecules";
import { STAT_CATEGORIES } from "../../universal/sub-atoms";

export class StatConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "Stat";
  }

  protected getDisplayName(): string {
    return "Stat";
  }

  protected getPluralDisplayName(): string {
    return "Stats";
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      MACHINE_NAME_FIELD_ATOM,
      NAME_FIELD_ATOM,
      DESCRIPTION_FIELD_ATOM,
      STAT_DATA_TYPE_FIELD_ATOM,
      STAT_VALUE_MIN_FIELD_ATOM,
      STAT_VALUE_MAX_FIELD_ATOM,
      STAT_DEFAULT_VALUE_FIELD_ATOM,
      {
        type: "enum",
        name: "category",
        label: "Category",
        values: [
          STAT_CATEGORIES.attribute,
          STAT_CATEGORIES.resource,
          STAT_CATEGORIES.offensive,
          STAT_CATEGORIES.defensive,
          STAT_CATEGORIES.utility,
        ] as const,
        required: true,
        displayFormat: "select",
      },
      ...AUDIT_FIELDS,
    ] as const;
  }
}

export const STAT_CONFIG = new StatConfigFactory().create();
