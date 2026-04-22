// src/config/entities/game-category/game-category-config-factory.ts
// Factory for GameCategory entity configuration.
// GameCategory belongs to GameDomain and GameSubdomain — two FK parents.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import {
  ID_FIELD_ATOM,
  GAME_DOMAIN_REF_FIELD_ATOM,
  GAME_SUBDOMAIN_REF_FIELD_ATOM,
} from "../../universal/atoms";
import { STANDARD_PERMISSIONS, BASE_ENTITY_FIELDS, AUDIT_FIELDS } from "../../universal/molecules";

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
    return STANDARD_PERMISSIONS;
  }

  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      GAME_DOMAIN_REF_FIELD_ATOM,
      GAME_SUBDOMAIN_REF_FIELD_ATOM,
      ...BASE_ENTITY_FIELDS,
      ...AUDIT_FIELDS,
    ] as const;
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
