// src/config/entities/game-subdomain/game-subdomain-config-factory.ts
// Factory for GameSubdomain entity configuration.
// GameSubdomain belongs to a GameDomain — the foreign key field is entity-specific.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import { GAME_DOMAIN_REF_FIELD_ATOM, SORT_ORDER_FIELD_ATOM } from "../../universal/atoms";

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
    return {
      create: "admin",
      read: "public",
      update: "admin",
      delete: "admin",
    };
  }

  /**
   * The foreign key field is inserted before the standard fields (name, description, etc.)
   * so the dropdown appears first in forms — user picks a domain, then names the subdomain.
   */
  protected override getEntitySpecificFields(): readonly FieldConfig[] {
    return [GAME_DOMAIN_REF_FIELD_ATOM, SORT_ORDER_FIELD_ATOM];
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
