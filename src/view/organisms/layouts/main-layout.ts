// src/view/organisms/layouts/main-layout.ts
// Root HTML document wrapper — every page renders inside this

import { escapeHtml } from "../../sub-atoms";
import { navItem } from "../../atoms";

function navigation(currentPath: string): string {
  return `
    <nav class="main-nav">
      <div class="main-nav__brand">RPG CMS</div>
      <ul class="main-nav__links">
        ${navItem("Game Domains", "/game-domains", currentPath.startsWith("/game-domains"))}
      </ul>
    </nav>`;
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
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; color: #1a1a1a; background: #f5f5f5; }
    .main-nav { background: #1a1a2e; color: white; padding: 0 2rem; display: flex; align-items: center; gap: 2rem; height: 56px; }
    .main-nav__brand { font-weight: 700; font-size: 1.1rem; color: #e0b84a; }
    .main-nav__links { list-style: none; display: flex; gap: 1rem; }
    .nav-item a { color: #ccc; text-decoration: none; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .nav-item--active a { color: white; background: rgba(255,255,255,0.1); }
    main { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; text-decoration: none; display: inline-block; }
    .btn--primary { background: #1a1a2e; color: white; }
    .btn--secondary { background: transparent; border: 1px solid #ccc; color: #333; }
    .btn--danger { background: #dc3545; color: white; }
    .btn--small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
    .link { color: #1a1a2e; text-decoration: underline; }
    .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .data-table th { background: #f8f8f8; padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
    .data-table td { padding: 0.75rem 1rem; border-top: 1px solid #eee; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .record-count { color: #666; font-size: 0.9rem; margin-bottom: 0.75rem; }
    .empty-state { text-align: center; color: #666; padding: 3rem; background: white; border-radius: 8px; }
    .entity-form { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 640px; }
    .form-field { margin-bottom: 1.25rem; }
    .form-field label { display: block; font-weight: 600; margin-bottom: 0.35rem; font-size: 0.9rem; }
    .form-field input, .form-field textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    .form-field textarea { min-height: 100px; resize: vertical; }
    .form-actions { display: flex; gap: 1rem; margin-top: 1.5rem; align-items: center; }
    .detail-list { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .detail-list__row { display: grid; grid-template-columns: 200px 1fr; padding: 0.75rem 1rem; border-top: 1px solid #eee; }
    .detail-list__row:first-child { border-top: none; }
    dt { font-weight: 600; color: #666; font-size: 0.9rem; }
    .badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
    .badge--active { background: #d4edda; color: #155724; }
    .badge--inactive { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  ${navigation(currentPath)}
  <main>
    ${content}
  </main>
</body>
</html>`;
}
