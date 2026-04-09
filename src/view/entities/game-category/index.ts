// src/view/entities/game-category/index.ts
// GameCategory views — custom listPage with domain + subdomain filter dropdowns

import type { ListView, SelectOption } from "@view-service/types";
import { filteredListPage } from "../../organisms/pages";
import type { FilterDropdownConfig } from "../../organisms/pages";

export { detailPage, createPage, editPage, duplicatePage } from "../../organisms/pages";

export interface CategoryFilterOptions {
  readonly domainOptions: readonly SelectOption[];
  readonly subdomainOptions: readonly SelectOption[];
}

export function listPage(
  view: ListView,
  basePath: string,
  filterOptions: CategoryFilterOptions,
  filterValues: Record<string, string | undefined>,
): string {
  const filters: FilterDropdownConfig[] = [
    {
      name: "game_domain_id",
      placeholder: "All Domains",
      options: filterOptions.domainOptions,
      selectedValue: filterValues["game_domain_id"],
    },
    {
      name: "game_subdomain_id",
      placeholder: "All Subdomains",
      options: filterOptions.subdomainOptions,
      selectedValue: filterValues["game_subdomain_id"],
    },
  ];
  return filteredListPage(view, basePath, filters);
}
