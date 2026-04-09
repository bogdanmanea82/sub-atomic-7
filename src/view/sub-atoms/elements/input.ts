// src/view/sub-atoms/elements/input.ts
// Renders HTML form inputs based on inputType from FormField

import { escapeHtml } from "./escape";
import type { SelectOption } from "@view-service/types";

/**
 * Renders the appropriate input element for a given inputType.
 * textarea gets its own element; select renders a dropdown; all others use <input>.
 */
export function input(
  name: string,
  inputType: string,
  value: unknown,
  required: boolean,
  options?: readonly SelectOption[],
): string {
  const requiredAttr = required ? " required" : "";
  const safeValue = value !== null && value !== undefined ? escapeHtml(String(value)) : "";

  if (inputType === "textarea") {
    return `<textarea id="${name}" name="${name}"${requiredAttr}>${safeValue}</textarea>`;
  }

  if (inputType === "checkbox") {
    const checkedAttr = value === true ? " checked" : "";
    return `<input type="hidden" name="${name}" value="false"><input type="checkbox" id="${name}" name="${name}" value="true"${checkedAttr}>`;
  }

  if (inputType === "select" && options) {
    const optionHtml = options.map((opt) => {
      const selected = opt.value === safeValue ? " selected" : "";
      return `<option value="${escapeHtml(opt.value)}"${selected}>${escapeHtml(opt.label)}</option>`;
    }).join("");
    return `<select id="${name}" name="${name}"${requiredAttr}><option value="">-- Select --</option>${optionHtml}</select>`;
  }

  return `<input type="${inputType}" id="${name}" name="${name}" value="${safeValue}"${requiredAttr}>`;
}
