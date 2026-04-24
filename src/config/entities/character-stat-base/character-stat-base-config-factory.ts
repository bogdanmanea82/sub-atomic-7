// src/config/entities/character-stat-base/character-stat-base-config-factory.ts
// Factory for CharacterStatBase junction entity configuration.
//
// Junction between Character and Stat: one row per (character, stat) pair,
// storing the baseline integer value before any modifiers are applied.
// Follows the ItemModifierBinding junction pattern: two hidden FK atoms + value column.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig } from "../../types";
import {
  ID_FIELD_ATOM,
  CHARACTER_ID_FIELD_ATOM,
  STAT_ID_FIELD_ATOM,
} from "../../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS } from "../../universal/molecules";
import { DISPLAY_FORMATS, FIELD_MARKERS, INTEGER_CONSTRAINTS } from "../../universal/sub-atoms";

export class CharacterStatBaseConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "CharacterStatBase";
  }

  protected getDisplayName(): string {
    return "Character Stat Base";
  }

  protected getPluralDisplayName(): string {
    return "Character Stat Bases";
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      CHARACTER_ID_FIELD_ATOM,
      STAT_ID_FIELD_ATOM,
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

export const CHARACTER_STAT_BASE_CONFIG = new CharacterStatBaseConfigFactory().create();
