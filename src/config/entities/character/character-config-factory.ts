// src/config/entities/character/character-config-factory.ts
// Factory for Character entity configuration.
//
// Character represents a playable class archetype (Warrior, Hunter, Wizard).
// Each character has a stat baseline defined by CharacterStatBase junction rows.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig } from "../../types";
import {
  ID_FIELD_ATOM,
  MACHINE_NAME_FIELD_ATOM,
  NAME_FIELD_ATOM,
  DESCRIPTION_FIELD_ATOM,
  IS_ACTIVE_FIELD_ATOM,
} from "../../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS } from "../../universal/molecules";

export class CharacterConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "Character";
  }

  protected getDisplayName(): string {
    return "Character";
  }

  protected getPluralDisplayName(): string {
    return "Characters";
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
      ...AUDIT_FIELDS,
    ] as const;
  }
}

export const CHARACTER_CONFIG = new CharacterConfigFactory().create();
