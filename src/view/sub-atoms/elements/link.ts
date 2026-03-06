// src/view/sub-atoms/elements/link.ts

import { escapeHtml } from "./escape";

export function link(
  label: string,
  href: string,
  variant: "default" | "secondary" | "danger" = "default"
): string {
  return `<a href="${escapeHtml(href)}" class="link link--${variant}">${escapeHtml(label)}</a>`;
}
