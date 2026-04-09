// src/view/sub-atoms/elements/link.ts

import { escapeHtml } from "./escape";

// Unicode icon constants — used across table rows, detail pages, and headers
export const ICON_VIEW = "\u25CE";   // ◎
export const ICON_EDIT = "\u270E";   // ✎
export const ICON_COPY = "\u29C9";   // ⧉
export const ICON_DELETE = "\u2716"; // ✖

export function link(
  label: string,
  href: string,
  variant: "default" | "secondary" | "danger" = "default",
  icon?: string,
  iconOnly = false,
): string {
  if (iconOnly && icon) {
    return `<a href="${escapeHtml(href)}" class="link link--${variant} link--icon-only" title="${escapeHtml(label)}">${icon}</a>`;
  }
  const iconHtml = icon ? `<span class="link__icon">${icon}</span> ` : "";
  return `<a href="${escapeHtml(href)}" class="link link--${variant}">${iconHtml}${escapeHtml(label)}</a>`;
}
