// src/config/entities/game-subcategory/game-subcategory-config-factory.ts
// Factory for GameSubcategory entity configuration.
// GameSubcategory belongs to GameDomain, GameSubdomain, and GameCategory — three foreign keys.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import { DISPLAY_FORMATS, FIELD_MARKERS } from "../../universal/sub-atoms";

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

const GAME_CATEGORY_ID_FIELD: FieldConfig = {
  name: "game_category_id",
  type: "reference",
  label: "Game Category",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
  targetEntity: "GameCategory",
  targetTable: "game_category",
  targetDisplayField: "name",
};

export class GameSubcategoryConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "GameSubcategory";
  }

  protected getDisplayName(): string {
    return "Game Subcategory";
  }

  protected getPluralDisplayName(): string {
    return "Game Subcategories";
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
   * Three foreign key fields in hierarchy order: domain → subdomain → category.
   * Each cascading dropdown filters the next.
   */
  protected override getEntitySpecificFields(): readonly FieldConfig[] {
    return [GAME_DOMAIN_ID_FIELD, GAME_SUBDOMAIN_ID_FIELD, GAME_CATEGORY_ID_FIELD];
  }

  protected override getRelationships(): readonly RelationshipConfig[] {
    return [
      {
        name: "gameDomain",
        type: "belongsTo",
        targetEntity: "GameDomain",
        foreignKey: "game_domain_id",
        inverseRelationship: "gameSubcategories",
      },
      {
        name: "gameSubdomain",
        type: "belongsTo",
        targetEntity: "GameSubdomain",
        foreignKey: "game_subdomain_id",
        inverseRelationship: "gameSubcategories",
      },
      {
        name: "gameCategory",
        type: "belongsTo",
        targetEntity: "GameCategory",
        foreignKey: "game_category_id",
        inverseRelationship: "gameSubcategories",
      },
    ];
  }
}

export const GAME_SUBCATEGORY_CONFIG = new GameSubcategoryConfigFactory().create();
