// src/view/molecules/sections/page-header.ts

import { escapeHtml, link } from "../../sub-atoms";

interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}

interface PageHeaderOptions {
  title: string;
  backUrl?: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  actionLabel?: string;
  actionUrl?: string;
  actions?: string;
}

export type { PageHeaderOptions, BreadcrumbItem };

function renderBreadcrumbs(items: readonly BreadcrumbItem[]): string {
  return `<nav class="breadcrumb">${items
    .map((item, i) => {
      const isLast = i === items.length - 1;
      const sep = isLast ? "" : ' <span class="breadcrumb__sep">\u203A</span> ';
      if (item.href && !isLast) {
        return `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>${sep}`;
      }
      return `<span>${escapeHtml(item.label)}</span>${sep}`;
    })
    .join("")}</nav>`;
}

export function pageHeader(options: PageHeaderOptions): string {
  const nav = options.breadcrumbs
    ? renderBreadcrumbs(options.breadcrumbs)
    : options.backUrl
      ? `<div class="page-header__back">${link("\u2190 Back", options.backUrl, "secondary")}</div>`
      : "";

  const rightSide = options.actions
    ? `<div class="page-header__actions">${options.actions}</div>`
    : options.actionUrl
      ? `<div class="page-header__right">
           ${link(options.actionLabel ?? "New", options.actionUrl, "default")}
         </div>`
      : "";

  return `
    <header class="page-header">
      ${nav}
      <div class="page-header__title-row">
        <h1>${escapeHtml(options.title)}</h1>
        ${rightSide}
      </div>
    </header>`;
}
