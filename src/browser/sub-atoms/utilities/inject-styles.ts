// src/browser/sub-atoms/utilities/inject-styles.ts
// Injects a CSS string into the document head exactly once per ID.

const injected = new Set<string>();

export function injectStylesOnce(id: string, css: string): void {
  if (injected.has(id)) return;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  injected.add(id);
}
