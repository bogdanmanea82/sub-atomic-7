// src/view-service/molecules/views/build-form-view.ts
// Builds form field definitions for create and edit forms

import type { EntityConfig } from "@config/types";
import type { FormView, FormField, SelectOption } from "../../types";
import { formatInputType } from "../../sub-atoms/formatters";

/**
 * Builds a form view model for a create or edit form.
 * Excludes hidden fields and auto-managed fields (uuid, timestamps).
 * currentValues populates field values for edit forms — omit for create forms.
 */
export function buildFormView(
  config: EntityConfig,
  currentValues?: Record<string, unknown>,
  errors?: Record<string, string>,
  selectOptions?: Record<string, readonly SelectOption[]>,
  titleOverride?: string,
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
      inputType: formatInputType(field),
      value: currentValues ? (currentValues[field.name] ?? null) : null,
      required: field.required,
    };
    const options = selectOptions?.[field.name];
    const withOptions = options ? { ...base, options } : base;
    const error = errors?.[field.name];
    return error ? { ...withOptions, error } : withOptions;
  });

  const title = titleOverride
    ?? (currentValues ? `Edit ${config.displayName}` : `New ${config.displayName}`);

  return { title, fields };
}
