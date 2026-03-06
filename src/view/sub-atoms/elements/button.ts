// src/view/sub-atoms/elements/button.ts

import { escapeHtml } from "./escape";

export function button(
  label: string,
  variant: "primary" | "secondary" | "danger" = "primary",
  type: "submit" | "button" = "button"
): string {
  return `<button type="${type}" class="btn btn--${variant}">${escapeHtml(label)}</button>`;
}

export function submitButton(label: string = "Save"): string {
  return button(label, "primary", "submit");
}
