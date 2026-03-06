// src/view-service/sub-atoms/formatters/format-input-type.ts
// Maps a FieldConfig's displayFormat to the corresponding HTML input type string.

import type { FieldConfig } from "@config/types";

export function formatInputType(field: FieldConfig): string {
  switch (field.displayFormat) {
    case "text":
      return "text";
    case "textarea":
      return "textarea";
    case "number":
      return "number";
    case "toggle":
      return "checkbox";
    case "datetime":
      return "datetime-local";
    case "select":
      return "select";
    default:
      return "text";
  }
}
