// src/config/entities/game-domain/game-domain-config-factory.ts
// Factory for GameDomain entity configuration.
// GameDomain is the top-level organizational unit — no FK parents.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig } from "../../types";
import { ID_FIELD_ATOM } from "../../universal/atoms";
import { STANDARD_PERMISSIONS, BASE_ENTITY_FIELDS, AUDIT_FIELDS } from "../../universal/molecules";

export class GameDomainConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "GameDomain";
  }

  protected getDisplayName(): string {
    return "Game Domain";
  }

  protected getPluralDisplayName(): string {
    return "Game Domains";
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      ...BASE_ENTITY_FIELDS,
      ...AUDIT_FIELDS,
    ] as const;
  }
}

export const GAME_DOMAIN_CONFIG = new GameDomainConfigFactory().create();
