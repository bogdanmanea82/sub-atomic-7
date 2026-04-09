// src/config/entities/game-subcategory/game-subcategory-config-factory.ts
// Factory for GameSubcategory entity configuration.
// GameSubcategory belongs to GameDomain, GameSubdomain, and GameCategory — three foreign keys.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import {
  GAME_DOMAIN_REF_FIELD_ATOM,
  GAME_SUBDOMAIN_REF_FIELD_ATOM,
  GAME_CATEGORY_REF_FIELD_ATOM,
  SORT_ORDER_FIELD_ATOM,
} from "../../universal/atoms";

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
    return [GAME_DOMAIN_REF_FIELD_ATOM, GAME_SUBDOMAIN_REF_FIELD_ATOM, GAME_CATEGORY_REF_FIELD_ATOM, SORT_ORDER_FIELD_ATOM];
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
