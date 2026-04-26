// src/view/sub-atoms/elements/badge.ts

import { escapeHtml } from "./escape";

/**
 * Renders a status badge.
 * cssClass comes from formatStatusClass() in Layer 4 — already a safe string.
 */
export function badge(label: string, cssClass: string): string {
  return `<span class="${cssClass}">${escapeHtml(label)}</span>`;
}

/** Compact dot + label badge derived from lifecycle state. Used in page headers. */
export function statusBadgeInline(isActive: boolean, archivedAt?: string): string {
  if (archivedAt) {
    return `<span class="status-dot status-dot--archived"></span><span class="lifecycle-label lifecycle--archived">Archived</span>`;
  }
  if (!isActive) {
    return `<span class="status-dot status-dot--inactive"></span><span class="lifecycle-label lifecycle--deactivated">Disabled</span>`;
  }
  return `<span class="status-dot status-dot--active"></span><span class="lifecycle-label lifecycle--active">Active</span>`;
}
