// src/view/sub-atoms/elements/input.ts
// Renders HTML form inputs based on inputType from FormField

import { escapeHtml } from "./escape";

/**
 * Renders the appropriate input element for a given inputType.
 * textarea gets its own element; all others use <input>.
 */
export function input(
  name: string,
  inputType: string,
  value: unknown,
  required: boolean
): string {
  const requiredAttr = required ? " required" : "";
  const safeValue = value !== null && value !== undefined ? escapeHtml(String(value)) : "";

  if (inputType === "textarea") {
    return `<textarea id="${name}" name="${name}"${requiredAttr}>${safeValue}</textarea>`;
  }

  if (inputType === "checkbox") {
    const checkedAttr = value === true ? " checked" : "";
    return `<input type="checkbox" id="${name}" name="${name}" value="true"${checkedAttr}${requiredAttr}>`;
  }

  return `<input type="${inputType}" id="${name}" name="${name}" value="${safeValue}"${requiredAttr}>`;
}
