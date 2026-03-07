// src/view/sub-atoms/elements/nav-config.ts
// Data-driven navigation configuration. Add new entities here — the layout picks them up automatically.

export interface NavItemConfig {
  readonly label: string;
  readonly href: string;
}

export const NAV_ITEMS: readonly NavItemConfig[] = [
  { label: "Home", href: "/" },
  { label: "Game Domains", href: "/game-domains" },
  { label: "Game Subdomains", href: "/game-subdomains" },
  { label: "Game Categories", href: "/game-categories" },
  { label: "Game Subcategories", href: "/game-subcategories" },
  { label: "Modifiers", href: "/modifiers" },
];
