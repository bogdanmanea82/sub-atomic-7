// src/view/organisms/pages/filtered-list-page.ts
// Generic list page with configurable filter dropdowns above the table.
// Used by hierarchy entities (subdomain, category, subcategory) that filter by parent FK.

import type { ListView, SelectOption } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader } from "../../molecules";
import { dataTable } from "../../molecules";
import { escapeHtml } from "../../sub-atoms";

export interface FilterDropdownConfig {
  readonly name: string;
  readonly placeholder: string;
  readonly options: readonly SelectOption[];
  readonly selectedValue?: string;
}

function filterSelect(filter: FilterDropdownConfig): string {
  const opts = filter.options
    .map((o) => {
      const selected = o.value === filter.selectedValue ? " selected" : "";
      return `<option value="${escapeHtml(o.value)}"${selected}>${escapeHtml(o.label)}</option>`;
    })
    .join("");
  return `<select name="${filter.name}" id="filter_${filter.name}">
    <option value="">${escapeHtml(filter.placeholder)}</option>
    ${opts}
  </select>`;
}

/**
 * Renders a list page with filter dropdowns, preserving filter params in pagination links.
 */
export function filteredListPage(
  view: ListView,
  basePath: string,
  filters: readonly FilterDropdownConfig[],
): string {
  const filterParams = filters
    .filter((f) => f.selectedValue)
    .map((f) => `${f.name}=${encodeURIComponent(f.selectedValue!)}`)
    .join("&");
  const paginationBasePath = filterParams ? `${basePath}?${filterParams}` : basePath;
  const hasFilters = filterParams.length > 0;

  const filterBar = `
    <form method="GET" action="${basePath}" class="filter-bar">
      ${filters.map((f) => filterSelect(f)).join("\n      ")}
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
