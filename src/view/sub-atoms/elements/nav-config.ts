// src/view/sub-atoms/elements/nav-config.ts
// Data-driven navigation configuration. Add new entities here — the layout picks them up automatically.

export interface NavChildItem {
  readonly label: string;
  readonly href: string;
}

export interface NavItemConfig {
  readonly label: string;
  readonly href?: string;
  readonly children?: readonly NavChildItem[];
}

export const NAV_ITEMS: readonly NavItemConfig[] = [
  { label: "Home", href: "/" },
  {
    label: "Hierarchy",
    children: [
      { label: "Domains",       href: "/game-domains" },
      { label: "Subdomains",    href: "/game-subdomains" },
      { label: "Categories",    href: "/game-categories" },
      { label: "Subcategories", href: "/game-subcategories" },
    ],
  },
  { label: "Stats", href: "/stats" },
  {
    label: "Character",
    children: [
      { label: "Character Classes", href: "/character-classes" },
    ],
  },
  {
    label: "Modifiers",
    children: [
      { label: "Item Modifiers", href: "/modifiers" },
    ],
  },
  {
    label: "Assets",
    children: [
      { label: "Base Items", href: "/items" },
    ],
  },
];
