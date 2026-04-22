// src/config/factories/base-entity-config-factory.ts
// Abstract base factory for entity configuration.
//
// Subclasses must implement buildFields() explicitly — there is no default
// field ordering inherited from the base class. Every entity declares its own
// complete field composition, making it readable in a single file.

import type { EntityConfig, FieldConfig, PermissionConfig, RelationshipConfig } from "../types";

export abstract class BaseEntityConfigFactory {
  /**
   * Creates the complete entity configuration.
   * Template method — assembles all pieces from subclass implementations.
   */
  create(): EntityConfig {
    const relationships = this.getRelationships();
    const nonColumnKeys = this.getNonColumnKeys();
    return {
      name: this.getEntityName(),
      tableName: this.getTableName(),
      displayName: this.getDisplayName(),
      pluralDisplayName: this.getPluralDisplayName(),
      fields: this.buildFields(),
      permissions: this.getPermissions(),
      ...(relationships.length > 0 ? { relationships } : {}),
      ...(nonColumnKeys.length > 0 ? { nonColumnKeys } : {}),
    };
  }

  // Abstract — every subclass MUST implement these
  protected abstract getEntityName(): string;
  protected abstract getDisplayName(): string;
  protected abstract getPluralDisplayName(): string;
  protected abstract getPermissions(): PermissionConfig;

  /**
   * Declare the complete ordered field list for this entity.
   * Use atoms and molecules from universal/ and molecules/ — no inline definitions.
   * Abstract: every entity must show its own field composition explicitly.
   */
  protected abstract buildFields(): readonly FieldConfig[];

  // Concrete default — override to declare relationships
  protected getRelationships(): readonly RelationshipConfig[] {
    return [];
  }

  /**
   * Form keys that are service-layer concerns (not DB columns) and must be
   * stripped before any UPDATE query. Override in entities that have virtual
   * form fields — e.g. "status_action", "tiers_json".
   * Default: no keys to strip.
   */
  protected getNonColumnKeys(): readonly string[] {
    return [];
  }

  // Derives DB table name from entity name: "GameSubdomain" → "game_subdomain"
  protected getTableName(): string {
    return this.toSnakeCase(this.getEntityName());
  }

  protected toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, "");
  }
}
