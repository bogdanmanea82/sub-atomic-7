// src/view/molecules/sections/detail-section.ts

import type { DetailView } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";

const EXCLUDED_FIELDS = new Set(["is_active", "created_at", "updated_at", "archived_at", "archived_reason"]);

/**
 * Renders a two-column definition list of field label → value pairs.
 * Lifecycle fields (timestamps, archive) are excluded — shown in History tab instead.
 */
export function detailSection(view: DetailView): string {
  const mainFields = view.fields.filter((f) => !EXCLUDED_FIELDS.has(f.name));

  const rows = mainFields
    .map(
      (f) => `
        <div class="detail-list__row">
          <dt>${escapeHtml(f.label)}</dt>
          <dd>${f.value}</dd>
        </div>`,
    )
    .join("");

  return `
    <dl class="detail-list detail-list--two-col">
      ${rows}
    </dl>`;
}
