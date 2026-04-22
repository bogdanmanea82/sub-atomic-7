// src/controller/sub-atoms/options/build-cascading-options.ts
// Fetches the four hierarchy dropdown option arrays in one parallel call.
//
// Each level below domain is only fetched when the parent ID is present —
// this handles both the filter/create pattern (optional IDs) and the edit/duplicate
// pattern (all IDs always present) with a single function.
//
// FK scope field names are the canonical hierarchy column names and do not change.

import type { SelectOption } from "@view-service/types";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { GameCategoryService } from "@model-service/entities/game-category";
import { GameSubcategoryService } from "@model-service/entities/game-subcategory";
import { fetchOptions } from "./fetch-options";

const EMPTY: readonly SelectOption[] = [];

export async function buildCascadingOptions(filters: {
  readonly domainId?: string;
  readonly subdomainId?: string;
  readonly categoryId?: string;
}): Promise<{
  readonly domainOptions: readonly SelectOption[];
  readonly subdomainOptions: readonly SelectOption[];
  readonly categoryOptions: readonly SelectOption[];
  readonly subcategoryOptions: readonly SelectOption[];
}> {
  const { domainId, subdomainId, categoryId } = filters;

  const [domainOptions, subdomainOptions, categoryOptions, subcategoryOptions] = await Promise.all([
    fetchOptions(GameDomainService),
    domainId    ? fetchOptions(GameSubdomainService, { game_domain_id:    domainId    }) : Promise.resolve(EMPTY),
    subdomainId ? fetchOptions(GameCategoryService,  { game_subdomain_id: subdomainId }) : Promise.resolve(EMPTY),
    categoryId  ? fetchOptions(GameSubcategoryService, { game_category_id: categoryId }) : Promise.resolve(EMPTY),
  ]);

  return { domainOptions, subdomainOptions, categoryOptions, subcategoryOptions };
}
