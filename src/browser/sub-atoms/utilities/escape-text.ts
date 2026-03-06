// src/browser/sub-atoms/utilities/escape-text.ts
// Prevents HTML injection by escaping user-provided text via the DOM.

export function escapeText(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
