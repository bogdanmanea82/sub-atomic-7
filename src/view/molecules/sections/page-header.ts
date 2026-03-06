// src/view/molecules/sections/page-header.ts

import { escapeHtml, link } from "../../sub-atoms";

interface PageHeaderOptions {
  title: string;
  backUrl?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export function pageHeader(options: PageHeaderOptions): string {
  return `
    <header class="page-header">
      <div class="page-header__left">
        ${options.backUrl ? link("← Back", options.backUrl, "secondary") : ""}
        <h1>${escapeHtml(options.title)}</h1>
      </div>
      ${
        options.actionUrl
          ? `<div class="page-header__right">
               ${link(options.actionLabel ?? "New", options.actionUrl, "default")}
             </div>`
          : ""
      }
    </header>`;
}
