// src/view-service/atoms/field-display/prepare-field.ts
// Dispatches to the correct formatter based on field type and config

import type { FieldConfig } from "@config/types";
import type { DisplayField } from "../../types";
import {
  formatText,
  formatNumber,
  formatBoolean,
  formatDatetime,
} from "../../sub-atoms/formatters";

/**
 * A lookup map for resolving reference field UUIDs to display names.
 * Keyed by field name, value is a map of UUID → display name.
 */
export type ReferenceLookup = Record<string, Record<string, string>>;

/**
 * Prepares a single field value for display based on its FieldConfig.
 * Dispatches to the appropriate formatter via switch on field.type.
 * For reference fields, resolves the UUID to a display name via the lookup map.
 */
export function prepareField(
  entity: Record<string, unknown>,
  field: FieldConfig,
  referenceLookup?: ReferenceLookup,
): DisplayField {
  const rawValue = entity[field.name];

  return {
    name: field.name,
    label: field.label,
    value: formatFieldValue(rawValue, field, referenceLookup),
    rawValue,
    displayFormat: field.displayFormat,
  };
}

function formatFieldValue(
  value: unknown,
  field: FieldConfig,
  referenceLookup?: ReferenceLookup,
): string {
  if (value === null || value === undefined) {
    return "—";
  }

  switch (field.type) {
    case "string":
      return formatText(value as string);

    case "integer":
      return formatNumber(value as number);

    case "boolean":
      return formatBoolean(value as boolean);

    case "timestamp":
      return formatDatetime(value as Date);

    case "uuid":
      return value as string;

    case "reference": {
      const lookup = referenceLookup?.[field.name];
      return lookup?.[value as string] ?? String(value);
    }

    default:
      return String(value);
  }
}
