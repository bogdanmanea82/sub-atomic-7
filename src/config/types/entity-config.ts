// src/config/types/entity-config.ts
// Type definitions for entity configuration - the complete specification for an entity

import type { FieldConfig } from "./field-config";

/**
 * Permission levels for entity operations.
 */

export type PermissionLevel = "public" | "authenticated" | "admin";

/**
 * CRUD operation types.
 */

export type CrudOperations = "create" | "read" | "update" | "delete";

/**
 * Permission configuration mapping operations to required permission levels.
 */
export type PermissionConfig = {
  readonly [K in CrudOperations]: PermissionLevel;
};

/**
 * Complete configuration for an entity.
 * This is what factory organisms produce.
 */
export interface EntityConfig {
  readonly name: string;
  readonly tableName: string;
  readonly displayName: string;
  readonly pluralDisplayName: string;
  readonly fields: readonly FieldConfig[];
  readonly permissions: PermissionConfig;
}
