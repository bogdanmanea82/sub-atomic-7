// src/view/atoms/components/form-field.ts

import type { FormField } from "@view-service/types";
import { escapeHtml, input } from "../../sub-atoms";

/**
 * Renders a complete form field: label + input element.
 * Required fields get a visual marker via CSS class.
 */
export function formField(field: FormField): string {
  const errorClass = field.error ? " form-field--invalid" : "";
  const errorHtml = field.error
    ? `<span class="field-error">${escapeHtml(field.error)}</span>`
    : "";
  return `
    <div class="form-field${field.required ? " form-field--required" : ""}${errorClass}">
      <label for="${field.name}">${escapeHtml(field.label)}</label>
      ${input(field.name, field.inputType, field.value, field.required)}
      ${errorHtml}
    </div>`;
}
