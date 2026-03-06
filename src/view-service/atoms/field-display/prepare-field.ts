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
 * Prepares a single field value for display based on its FieldConfig.
 * Dispatches to the appropriate formatter via switch on field.type.
 * Returns a DisplayField with the formatted string value and original raw value.
 */
export function prepareField(
  entity: Record<string, unknown>,
  field: FieldConfig
): DisplayField {
  const rawValue = entity[field.name];

  return {
    name: field.name,
    label: field.label,
    value: formatFieldValue(rawValue, field),
    rawValue,
    displayFormat: field.displayFormat,
  };
}

function formatFieldValue(value: unknown, field: FieldConfig): string {
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

    default:
      return String(value);
  }
}
