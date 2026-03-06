// src/view/molecules/sections/detail-section.ts

import type { DetailView } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";

/**
 * Renders a definition list of field label → value pairs for a detail/show page.
 */
export function detailSection(view: DetailView): string {
  return `
    <dl class="detail-list">
      ${view.fields
        .map(
          (f) => `
        <div class="detail-list__row">
          <dt>${escapeHtml(f.label)}</dt>
          <dd>${f.value}</dd>
        </div>`
        )
        .join("")}
    </dl>`;
}
