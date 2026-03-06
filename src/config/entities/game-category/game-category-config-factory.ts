// src/config/entities/game-category/game-category-config-factory.ts
// Factory for GameCategory entity configuration.
// GameCategory belongs to both a GameDomain and a GameSubdomain — two foreign key fields.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import { DISPLAY_FORMATS, FIELD_MARKERS } from "../../universal/sub-atoms";

/**
 * The game_domain_id reference field — links the category to its grandparent domain.
 * Appears first in forms so the user selects a domain before the subdomain filters.
 */
const GAME_DOMAIN_ID_FIELD: FieldConfig = {
  name: "game_domain_id",
  type: "reference",
  label: "Game Domain",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
  targetEntity: "GameDomain",
  targetTable: "game_domain",
  targetDisplayField: "name",
};

/**
 * The game_subdomain_id reference field — links the category to its direct parent subdomain.
 * Filtered by the selected domain via cascading dropdown on the client side.
 */
const GAME_SUBDOMAIN_ID_FIELD: FieldConfig = {
  name: "game_subdomain_id",
  type: "reference",
  label: "Game Subdomain",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
  targetEntity: "GameSubdomain",
  targetTable: "game_subdomain",
  targetDisplayField: "name",
};

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
    return [GAME_DOMAIN_ID_FIELD, GAME_SUBDOMAIN_ID_FIELD];
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
