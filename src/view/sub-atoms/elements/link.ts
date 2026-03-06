// src/view/sub-atoms/elements/link.ts

import { escapeHtml } from "./escape";

export function link(
  label: string,
  href: string,
  variant: "default" | "secondary" | "danger" = "default",
  icon?: string
): string {
  const iconHtml = icon ? `<span class="link__icon">${icon}</span> ` : "";
  return `<a href="${escapeHtml(href)}" class="link link--${variant}">${iconHtml}${escapeHtml(label)}</a>`;
}
