// src/config/entities/game-category/game-category-config-factory.ts
// Factory for GameCategory entity configuration.
// GameCategory belongs to both a GameDomain and a GameSubdomain — two foreign key fields.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import {
  GAME_DOMAIN_REF_FIELD_ATOM,
  GAME_SUBDOMAIN_REF_FIELD_ATOM,
  SORT_ORDER_FIELD_ATOM,
} from "../../universal/atoms";

export class GameCategoryConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "GameCategory";
  }

  protected getDisplayName(): string {
    return "Game Category";
  }

  protected getPluralDisplayName(): string {
    return "Game Categories";
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
   * Both foreign key fields appear before the standard fields.
   * Order matters: domain first, then subdomain — matching the cascade UX.
   */
  protected override getEntitySpecificFields(): readonly FieldConfig[] {
    return [GAME_DOMAIN_REF_FIELD_ATOM, GAME_SUBDOMAIN_REF_FIELD_ATOM, SORT_ORDER_FIELD_ATOM];
  }

  protected override getRelationships(): readonly RelationshipConfig[] {
    return [
      {
        name: "gameDomain",
        type: "belongsTo",
        targetEntity: "GameDomain",
        foreignKey: "game_domain_id",
        inverseRelationship: "gameCategories",
      },
      {
        name: "gameSubdomain",
        type: "belongsTo",
        targetEntity: "GameSubdomain",
        foreignKey: "game_subdomain_id",
        inverseRelationship: "gameCategories",
      },
    ];
  }
}

export const GAME_CATEGORY_CONFIG = new GameCategoryConfigFactory().create();
