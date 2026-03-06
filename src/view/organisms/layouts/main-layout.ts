// src/view/organisms/layouts/main-layout.ts
// Root HTML document wrapper — every page renders inside this

import { escapeHtml, NAV_ITEMS, globalStyles } from "../../sub-atoms";
import { navItem } from "../../atoms";

function isActive(itemHref: string, currentPath: string): boolean {
  return itemHref === "/" ? currentPath === "/" : currentPath.startsWith(itemHref);
}

function navigation(currentPath: string): string {
  return `
    <nav class="main-nav">
      <a href="/" class="main-nav__brand">RPG CMS</a>
      <ul class="main-nav__links">
        ${NAV_ITEMS.map((item) => navItem(item.label, item.href, isActive(item.href, currentPath))).join("\n        ")}
      </ul>
    </nav>`;
}

function footer(): string {
  return `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <p class="site-footer__brand">RPG CMS <span class="site-footer__version">v0.1.0</span></p>
        <p class="site-footer__arch">Seven-layer atomic design &middot; sub-atomic-7</p>
      </div>
    </footer>`;
}

/**
 * Wraps any page content in the full HTML document shell.
 * currentPath is used to highlight the active nav item.
 */
export function mainLayout(content: string, title: string, currentPath: string = "/"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — RPG CMS</title>
  <style>${globalStyles()}</style>
</head>
<body>
  ${navigation(currentPath)}
  <main>
    ${content}
  </main>
  ${footer()}
  <script src="/public/main.js" defer></script>
</body>
</html>`;
}
