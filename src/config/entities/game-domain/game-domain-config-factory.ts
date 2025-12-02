// src/config/entities/game-domain/game-domain-config-factory.ts
// Factory for GameDomain entity configuration

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { PermissionConfig } from "../../types";

/**
 * Factory for creating GameDomain entity configuration.
 * GameDomain is the top-level organizational unit in the RPG CMS.
 */
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
    return {
      create: "admin",
      read: "public",
      update: "admin",
      delete: "admin",
    };
  }
}

// Create and export the configuration instance
export const GAME_DOMAIN_CONFIG = new GameDomainConfigFactory().create();
