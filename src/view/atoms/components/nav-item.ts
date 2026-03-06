// src/view/atoms/components/nav-item.ts

import { escapeHtml } from "../../sub-atoms";

export function navItem(label: string, href: string, active: boolean = false): string {
  return `<li class="nav-item${active ? " nav-item--active" : ""}">
    <a href="${escapeHtml(href)}">${escapeHtml(label)}</a>
  </li>`;
}
