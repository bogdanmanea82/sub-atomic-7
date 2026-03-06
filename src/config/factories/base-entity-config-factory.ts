// src/config/factories/base-entity-config-factory.ts
// Abstract base factory for entity configuration

import type { EntityConfig, FieldConfig, PermissionConfig, RelationshipConfig } from "../types";
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
    const relationships = this.getRelationships();
    return {
      name: this.getEntityName(),
      tableName: this.getTableName(),
      displayName: this.getDisplayName(),
      pluralDisplayName: this.getPluralDisplayName(),
      fields: this.buildFields(),
      permissions: this.getPermissions(),
      ...(relationships.length > 0 ? { relationships } : {}),
    };
  }

  // Abstract methods - subclasses MUST implement these
  protected abstract getEntityName(): string;
  protected abstract getDisplayName(): string;
  protected abstract getPluralDisplayName(): string;
  protected abstract getPermissions(): PermissionConfig;

  // Hook methods - subclasses CAN override to add entity-specific fields/relationships
  protected getEntitySpecificFields(): readonly FieldConfig[] {
    return [];
  }

  protected getRelationships(): readonly RelationshipConfig[] {
    return [];
  }

  // Concrete methods - shared implementation
  protected getTableName(): string {
    return this.toSnakeCase(this.getEntityName());
  }

  protected buildFields(): readonly FieldConfig[] {
    const [idField, ...restStandard] = STANDARD_ENTITY_FIELDS;
    const entityFields = this.getEntitySpecificFields();
    return [
      idField,
      ...entityFields,
      ...restStandard,
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
