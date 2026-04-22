// src/view/sub-atoms/elements/filter-select.ts
// Renders a single <select> element for a filter bar.
// Used by any list page that needs hierarchy or enum filters above the table.
// Reusable across all entity types that have cascading or standalone filter dropdowns.

import type { SelectOption } from "@view-service/types";
import { escapeHtml } from "./escape";

/**
 * Renders a <select> element for use in a filter bar form.
 * An empty option is always prepended with the placeholder text.
 * The `id` attribute is set to `filter_<name>` for CSS targeting.
 */
export function filterSelect(
  name: string,
  placeholder: string,
  options: readonly SelectOption[],
  selectedValue?: string,
): string {
  const opts = options
    .map((o) => {
      const selected = o.value === selectedValue ? " selected" : "";
      return `<option value="${escapeHtml(o.value)}"${selected}>${escapeHtml(o.label)}</option>`;
    })
    .join("");
  return `<select name="${name}" id="filter_${name}">
    <option value="">${escapeHtml(placeholder)}</option>
    ${opts}
  </select>`;
}
