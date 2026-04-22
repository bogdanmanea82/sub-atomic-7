// src/config/types/entity-config.ts
// Type definitions for entity configuration - the complete specification for an entity

import type { FieldConfig } from "./field-config";
import type { RelationshipConfig } from "./relationship-config";

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
  readonly relationships?: readonly RelationshipConfig[];
  /**
   * Form field names that are service-layer concerns and must be stripped
   * before a DB write. Examples: "tiers_json", "status_action", "status_reason".
   * Consumed by updateEntityWorkflow (automatic strip) and any service that
   * builds its own update query (reads and strips manually).
   */
  readonly nonColumnKeys?: readonly string[];
}
