// src/config/entities/game-subdomain/game-subdomain-config-factory.ts
// Factory for GameSubdomain entity configuration.
// GameSubdomain belongs to a GameDomain — the foreign key field is entity-specific.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import { DISPLAY_FORMATS, FIELD_MARKERS } from "../../universal/sub-atoms";

/**
 * The game_domain_id reference field — a required foreign key
 * that links every subdomain to its parent domain.
 * Rendered as a <select> dropdown in forms.
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
    return [GAME_DOMAIN_ID_FIELD];
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
