// src/config/types/relationship-config.ts
// Type definitions for entity relationships

/**
 * Types of relationships between entities.
 */

export type RelationshipType = "belongsTo" | "hasMany" | "hasOne";

/**
 * Configuration for a relationship to another entity.
 */

export interface RelationshipConfig {
  readonly name: string;
  readonly type: RelationshipType;
  readonly targetEntity: string;
  readonly foreignKey: string;
  readonly inverseRelationship?: string;
}
