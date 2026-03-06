// src/view/atoms/components/form-field.ts

import type { FormField } from "@view-service/types";
import { escapeHtml, input } from "../../sub-atoms";

/**
 * Renders a complete form field: label + input element.
 * Required fields get a visual marker via CSS class.
 */
export function formField(field: FormField): string {
  return `
    <div class="form-field${field.required ? " form-field--required" : ""}">
      <label for="${field.name}">${escapeHtml(field.label)}</label>
      ${input(field.name, field.inputType, field.value, field.required)}
    </div>`;
}
