// src/view/sub-atoms/elements/badge.ts

import { escapeHtml } from "./escape";

/**
 * Renders a status badge.
 * cssClass comes from formatStatusClass() in Layer 4 — already a safe string.
 */
export function badge(label: string, cssClass: string): string {
  return `<span class="${cssClass}">${escapeHtml(label)}</span>`;
}
