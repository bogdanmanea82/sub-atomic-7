// src/view/entities/game-subdomain/index.ts
// GameSubdomain views — custom listPage with domain filter dropdown

import type { ListView, SelectOption } from "@view-service/types";
import { filteredListPage } from "../../organisms/pages";
import type { FilterDropdownConfig } from "../../organisms/pages";

export { detailPage, createPage, editPage, duplicatePage } from "../../organisms/pages";

export interface SubdomainFilterOptions {
  readonly domainOptions: readonly SelectOption[];
}

export function listPage(
  view: ListView,
  basePath: string,
  filterOptions: SubdomainFilterOptions,
  filterValues: Record<string, string | undefined>,
): string {
  const filters: FilterDropdownConfig[] = [
    {
      name: "game_domain_id",
      placeholder: "All Domains",
      options: filterOptions.domainOptions,
      selectedValue: filterValues["game_domain_id"],
    },
  ];
  return filteredListPage(view, basePath, filters);
}
