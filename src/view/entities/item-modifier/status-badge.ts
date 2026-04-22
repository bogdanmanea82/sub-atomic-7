// src/view/entities/item-modifier/status-badge.ts
// Renders a read-only status badge for the detail page.
// Shows a coloured dot + label derived from isActive and archivedAt.

import { escapeHtml } from "../../sub-atoms";

/**
 * Renders a read-only status badge for the detail page.
 * Three states: archived (has archivedAt) → disabled (!isActive) → active.
 */
export function statusBadge(
  isActive: boolean,
  archivedAt?: string,
  archivedReason?: string,
): string {
  if (archivedAt) {
    const reasonHtml = archivedReason
      ? `<p class="status-section__archive-reason">${escapeHtml(archivedReason)}</p>`
      : "";
    return `
      <div class="status-section">
        <div class="status-section__signal">
          <span class="status-dot status-dot--archived"></span>
          <span class="lifecycle-label lifecycle--archived" style="margin-left:0.5rem">Archived</span>
        </div>
        ${reasonHtml ? `<div class="status-section__archive"><span class="status-section__archive-label">Reason:</span>${reasonHtml}</div>` : ""}
      </div>`;
  }
  if (!isActive) {
    return `
      <div class="status-section">
        <div class="status-section__signal">
          <span class="status-dot status-dot--inactive"></span>
          <span class="lifecycle-label lifecycle--deactivated" style="margin-left:0.5rem">Disabled</span>
        </div>
      </div>`;
  }
  return `
    <div class="status-section">
      <div class="status-section__signal">
        <span class="status-dot status-dot--active"></span>
        <span class="lifecycle-label lifecycle--active" style="margin-left:0.5rem">Active</span>
      </div>
    </div>`;
}
