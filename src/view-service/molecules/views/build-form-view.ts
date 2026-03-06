// src/view-service/molecules/views/build-form-view.ts
// Builds form field definitions for create and edit forms

import type { EntityConfig, FieldConfig } from "@config/types";
import type { FormView, FormField } from "../../types";

/**
 * Maps a DisplayFormat to an HTML input type.
 */
function mapInputType(field: FieldConfig): string {
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
    default:
      return "text";
  }
}

/**
 * Builds a form view model for a create or edit form.
 * Excludes hidden fields and auto-managed fields (uuid, timestamps).
 * currentValues populates field values for edit forms — omit for create forms.
 */
export function buildFormView(
  config: EntityConfig,
  currentValues?: Record<string, unknown>,
  errors?: Record<string, string>,
): FormView {
  const editableFields = config.fields.filter(
    (f) =>
      f.displayFormat !== "hidden" &&
      f.type !== "uuid" &&
      f.type !== "timestamp"
  );

  const fields: FormField[] = editableFields.map((field) => {
    const base: FormField = {
      name: field.name,
      label: field.label,
      inputType: mapInputType(field),
      value: currentValues ? (currentValues[field.name] ?? null) : null,
      required: field.required,
    };
    const error = errors?.[field.name];
    return error ? { ...base, error } : base;
  });

  const title = currentValues
    ? `Edit ${config.displayName}`
    : `New ${config.displayName}`;

  return { title, fields };
}
