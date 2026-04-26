// src/view/entities/item/index.ts
// Custom Item pages — list page has hierarchy filter bar (like ItemModifier).
// Create/edit/duplicate pages include the stat sheet (like CharacterClass).

import type { ListView, SelectOption } from "@view-service/types";
import type { ItemFormView, ItemDetailView } from "@view-service/types";
import { mainLayout } from "../../organisms/layouts";
import { pageHeader, formSection, detailSection, dataTable } from "../../molecules";
import { link, deleteForm, filterSelect, ICON_EDIT, ICON_COPY, statusBadgeInline } from "../../sub-atoms";
import { statSheetFormSection } from "./stat-sheet-form-section";
import { statSheetDetailSection } from "./stat-sheet-detail-section";

// ── Filter bar types ──────────────────────────────────────────────────────────

export interface ItemFilterOptions {
  readonly domainOptions: readonly SelectOption[];
  readonly subdomainOptions: readonly SelectOption[];
  readonly categoryOptions: readonly SelectOption[];
  readonly subcategoryOptions: readonly SelectOption[];
}

// ── List page ─────────────────────────────────────────────────────────────────

export function listPage(
  view: ListView,
  basePath: string,
  filterOptions: ItemFilterOptions,
  filterValues: Record<string, string | undefined>,
): string {
  const filterParams = Object.entries(filterValues)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");
  const paginationBasePath = filterParams ? `${basePath}?${filterParams}` : basePath;
  const hasFilters = filterParams.length > 0;

  const filterBar = `
    <form method="GET" action="${basePath}" class="filter-bar">
      ${filterSelect("game_domain_id",      "All Domains",       filterOptions.domainOptions,       filterValues["game_domain_id"])}
      ${filterSelect("game_subdomain_id",   "All Subdomains",    filterOptions.subdomainOptions,    filterValues["game_subdomain_id"])}
      ${filterSelect("game_category_id",    "All Categories",    filterOptions.categoryOptions,     filterValues["game_category_id"])}
      ${filterSelect("game_subcategory_id", "All Subcategories", filterOptions.subcategoryOptions,  filterValues["game_subcategory_id"])}
      <button type="submit" class="btn btn--primary btn--small">Filter</button>
      ${hasFilters ? `<a href="${basePath}" class="btn btn--secondary btn--small">Clear</a>` : ""}
    </form>`;

  const content = `
    ${pageHeader({ title: view.title })}
    <div class="list-toolbar">
      <a href="${basePath}/new" class="btn btn--primary" title="New">+</a>
    </div>
    ${filterBar}
    ${dataTable(view, basePath, paginationBasePath)}`;

  return mainLayout(content, view.title, basePath);
}

// ── Detail page ───────────────────────────────────────────────────────────────

export function detailPage(
  view: ItemDetailView,
  id: string,
  basePath: string,
): string {
  const listName = basePath.slice(1).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const actions = `
    ${link("Edit", `${basePath}/${id}/edit`, "secondary", ICON_EDIT, true)}
    ${link("Duplicate", `${basePath}/${id}/duplicate`, "secondary", ICON_COPY, true)}
    ${deleteForm(`${basePath}/${id}/delete`, "Delete", false, true)}`;

  const content = `
    ${pageHeader({
      title: view.title,
      badge: view.isActive !== undefined ? statusBadgeInline(view.isActive) : undefined,
      breadcrumbs: [{ label: listName, href: basePath }, { label: view.title }],
      actions,
    })}
    ${detailSection(view)}
    ${statSheetDetailSection(view.statSheet)}`;

  return mainLayout(content, view.title, basePath);
}

// ── Create page ───────────────────────────────────────────────────────────────

export function createPage(
  view: ItemFormView,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const listName = basePath.slice(1).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: listName, href: basePath }, { label: "New" }],
    })}
    ${formSection(view, basePath, basePath, fieldConfigJson, statSheetFormSection(view.statSheet))}`;

  return mainLayout(content, view.title, basePath);
}

// ── Edit page ─────────────────────────────────────────────────────────────────

export function editPage(
  view: ItemFormView,
  id: string,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const listName = basePath.slice(1).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: listName, href: basePath }, { label: view.title }],
    })}
    ${formSection(view, `${basePath}/${id}`, `${basePath}/${id}`, fieldConfigJson, statSheetFormSection(view.statSheet))}
    <div style="margin-top:1rem; max-width:1100px">
      ${link("Duplicate", `${basePath}/${id}/duplicate`, "secondary", ICON_COPY, true)}
    </div>`;

  return mainLayout(content, view.title, basePath);
}

// ── Duplicate page ────────────────────────────────────────────────────────────

export function duplicatePage(
  view: ItemFormView,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const listName = basePath.slice(1).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: listName, href: basePath }, { label: "Duplicate" }],
    })}
    <div class="duplicate-notice">
      <strong>Duplicating entry.</strong> Update the Name and Machine Name before saving.
    </div>
    ${formSection(view, basePath, basePath, fieldConfigJson, statSheetFormSection(view.statSheet))}`;

  return mainLayout(content, view.title, basePath);
}
