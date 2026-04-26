// src/config/entities/game-subdomain/game-subdomain-config-factory.ts
// Factory for GameSubdomain entity configuration.
// GameSubdomain belongs to a GameDomain — one FK parent.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import {
  ID_FIELD_ATOM,
  GAME_DOMAIN_REF_FIELD_ATOM,
} from "../../universal/atoms";
import { STANDARD_PERMISSIONS, BASE_ENTITY_FIELDS, AUDIT_FIELDS, ARCHIVE_FIELDS } from "../../universal/molecules";

export class GameSubdomainConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "GameSubdomain";
  }

  protected getDisplayName(): string {
    return "Game Subdomain";
  }

  protected getPluralDisplayName(): string {
    return "Game Subdomains";
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      GAME_DOMAIN_REF_FIELD_ATOM,
      ...BASE_ENTITY_FIELDS,
      ...ARCHIVE_FIELDS,
      ...AUDIT_FIELDS,
    ] as const;
  }

  protected override getNonColumnKeys(): readonly string[] {
    return ["status_action", "status_reason"];
  }

  protected override getRelationships(): readonly RelationshipConfig[] {
    return [
      {
        name: "gameDomain",
        type: "belongsTo",
        targetEntity: "GameDomain",
        foreignKey: "game_domain_id",
        inverseRelationship: "gameSubdomains",
      },
    ];
  }
}

export const GAME_SUBDOMAIN_CONFIG = new GameSubdomainConfigFactory().create();
