// src/config/factories/base-entity-config-factory.ts
// Abstract base factory for entity configuration

import type { EntityConfig, FieldConfig, PermissionConfig } from "../types";
import { AUDIT_FIELDS, STANDARD_ENTITY_FIELDS } from "../universal/molecules";

/**
 * Abstract base factory for creating entity configurations.
 * Subclasses implement entity-specific details while inheriting common structure.
 */
export abstract class BaseEntityConfigFactory {
  /**
   * Creates the complete entity configuration.
   * Template method that assembles all pieces.
   */
  create(): EntityConfig {
    return {
      name: this.getEntityName(),
      tableName: this.getTableName(),
      displayName: this.getDisplayName(),
      pluralDisplayName: this.getPluralDisplayName(),
      fields: this.buildFields(),
      permissions: this.getPermissions(),
    };
  }

  // Abstract methods - subclasses MUST implement these
  protected abstract getEntityName(): string;
  protected abstract getDisplayName(): string;
  protected abstract getPluralDisplayName(): string;
  protected abstract getPermissions(): PermissionConfig;

  // Hook method - subclasses CAN override to add entity-specific fields
  protected getEntitySpecificFields(): readonly FieldConfig[] {
    return [];
  }

  // Concrete methods - shared implementation
  protected getTableName(): string {
    return this.toSnakeCase(this.getEntityName());
  }

  protected buildFields(): readonly FieldConfig[] {
    return [
      ...STANDARD_ENTITY_FIELDS,
      ...this.getEntitySpecificFields(),
      ...AUDIT_FIELDS,
    ] as const;
  }

  protected toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, "");
  }
}
