// src/model/universal/atoms/serialize-entity.ts
// Orchestrates serialization sub-atoms based on entity configuration
// Transforms validated TypeScript data into database-ready format

import type { EntityConfig, FieldConfig } from "../../../config/types";
import { serializeString } from "../sub-atoms/serialization/serialize-string";
import { serializeInteger } from "../sub-atoms/serialization/serialize-integer";
import { serializeBoolean } from "../sub-atoms/serialization/serialize-boolean";
import { serializeDatetime } from "../sub-atoms/serialization/serialize-datetime";

// Type for serialized output - values are database-ready
export type SerializedData = {
  readonly [fieldName: string]: unknown;
};

/**
 * Serializes validated data for database storage.
 * Orchestrates serialization sub-atoms based on field types.
 * Handles auto-set timestamps for create/update operations.
 */
export function serializeEntity(
  config: EntityConfig,
  data: Record<string, unknown>,
  operation: "create" | "update"
): SerializedData {
  const serialized: Record<string, unknown> = {};

  for (const field of config.fields) {
    const value = data[field.name];

    // Handle auto-set timestamps based on operation
    if (field.type === "timestamp" && field.autoSet !== "none") {
      if (field.autoSet === "create" && operation === "create") {
        serialized[field.name] = serializeDatetime(new Date());
      } else if (field.autoSet === "update") {
        serialized[field.name] = serializeDatetime(new Date());
      } else if (operation === "update" && field.autoSet === "create") {
        // Don't update created_at on update operations - skip this field
        continue;
      }
    } else {
      // Standard serialization based on field type
      serialized[field.name] = serializeField(field, value);
    }
  }

  return serialized as SerializedData;
}

/**
 * Serializes a single field value based on its configuration.
 * Uses switch on field.type to dispatch to appropriate sub-atom.
 */

function serializeField(field: FieldConfig, value: unknown): unknown {
  // Null values pass through - database handles NULL
  if (value === null || value === undefined) {
    return null;
  }

  switch (field.type) {
    case "string":
      return serializeString(value as string);

    case "integer":
      return serializeInteger(value as number);

    case "boolean":
      return serializeBoolean(value as boolean);

    case "timestamp":
      return serializeDatetime(value as Date);

    case "uuid":
      // UUIDs are already strings - pass through
      return value;

    default:
      throw new Error(`Unknown field Type: ${(field as FieldConfig).type}`);
  }
}
