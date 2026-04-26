// src/config/entities/character-class/character-class-config-factory.ts
// Factory for CharacterClass entity configuration.
//
// CharacterClass represents a playable archetype (Warrior, Hunter, Wizard).
// It owns a stat sheet: one base_value per stat, defaulted from stat.default_value.
// Min/max bounds remain authoritative on the Stat entity.
//
// "character" is reserved for future full player composition (assets + modifiers + class).

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig } from "../../types";
import {
  ID_FIELD_ATOM,
  MACHINE_NAME_FIELD_ATOM,
  NAME_FIELD_ATOM,
  DESCRIPTION_FIELD_ATOM,
  IS_ACTIVE_FIELD_ATOM,
} from "../../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS, ARCHIVE_FIELDS } from "../../universal/molecules";

export class CharacterClassConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "CharacterClass";
  }

  protected getDisplayName(): string {
    return "Character Class";
  }

  protected getPluralDisplayName(): string {
    return "Character Classes";
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
      IS_ACTIVE_FIELD_ATOM,
      ...ARCHIVE_FIELDS,
      ...AUDIT_FIELDS,
    ] as const;
  }

  protected override getNonColumnKeys(): readonly string[] {
    return ["status_action", "status_reason", "stat_sheet_json"];
  }
}

export const CHARACTER_CLASS_CONFIG = new CharacterClassConfigFactory().create();
