// src/model/universal/atoms/deserialize-entity.ts
// Orchestrates deserialization sub-atoms based on entity configuration
// Transforms database row into TypeScript types

import type { EntityConfig, FieldConfig } from "@config/types";
import { deserializeInteger } from "../sub-atoms/deserialization";
import { deserializeDatetime } from "../sub-atoms/deserialization";
import { deserializeString } from "../sub-atoms/deserialization/deserialize-string";
import { deserializeBoolean } from "../sub-atoms/deserialization/deserialize-boolean";

// Type for deserialized output - values are TypeScript-native types
export type DeserializedData = {
  readonly [fieldName: string]: unknown;
};

/**
 * Deserializes a database row into TypeScript types.
 * Orchestrates deserialization sub-atoms based on field types.
 */
export function deserializeEntity(
  config: EntityConfig,
  row: Record<string, unknown>
): DeserializedData {
  const deserialized: Record<string, unknown> = {};

  for (const field of config.fields) {
    const value = row[field.name];
    deserialized[field.name] = deserializeField(field, value);
  }

  return deserialized as DeserializedData;
}

/**
 * Deserializes a single field value based on its configuration.
 * Uses switch on field.type to dispatch to appropriate sub-atom.
 */
function deserializeField(field: FieldConfig, value: unknown): unknown {
  // Null values pass through - represent missing data in TypeScript too
  if (value === null || value === undefined) {
    return null;
  }

  switch (field.type) {
    case "string":
      return deserializeString(value as string);

    case "integer":
      return deserializeInteger(value as number);

    case "boolean":
      return deserializeBoolean(value as number);

    case "timestamp":
      return deserializeDatetime(value as Date);

    case "uuid":
    case "reference":
      // UUIDs and reference IDs come from database as strings — pass through
      return value;

    default:
      throw new Error(`Unknown field type: ${(field as FieldConfig).type}`);
  }
}
