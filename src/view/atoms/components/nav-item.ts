// src/view/atoms/components/nav-item.ts

import { escapeHtml } from "../../sub-atoms";
import type { NavItemConfig } from "../../sub-atoms/elements/nav-config";

export function navItem(item: NavItemConfig, active: boolean = false): string {
  if (item.children) {
    const childLinks = item.children
      .map((c) => `<li><a href="${escapeHtml(c.href)}">${escapeHtml(c.label)}</a></li>`)
      .join("\n          ");
    return `<li class="nav-item nav-item--has-dropdown${active ? " nav-item--active" : ""}">
    <span class="nav-item__trigger">${escapeHtml(item.label)} <span class="nav-item__caret">▾</span></span>
    <ul class="nav-item__dropdown">
          ${childLinks}
    </ul>
  </li>`;
  }
  return `<li class="nav-item${active ? " nav-item--active" : ""}">
    <a href="${escapeHtml(item.href!)}">${escapeHtml(item.label)}</a>
  </li>`;
}
