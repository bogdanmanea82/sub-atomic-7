// src/view-service/entities/game-category/game-category-view-service.ts
// Layer 4 organism — complete view preparation interface for GameCategory

import { GAME_CATEGORY_CONFIG } from "@config/entities/game-category";
import type { ListView, DetailView, FormView, SelectOption, PaginationMeta } from "../../types";
import type { ReferenceLookup } from "../../atoms/field-display";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig } from "../../molecules/views";

/**
 * Pre-binds GAME_CATEGORY_CONFIG so callers never import config directly.
 * Form methods accept both domainOptions and subdomainOptions for the two dropdowns.
 * List/detail methods accept a referenceLookup to resolve both parent UUIDs to names.
 */
export const GameCategoryViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, GAME_CATEGORY_CONFIG, referenceLookup, pagination);
  },

  prepareDetailView(
    entity: Record<string, unknown>,
    referenceLookup?: ReferenceLookup,
  ): DetailView {
    return buildDetailView(entity, GAME_CATEGORY_CONFIG, referenceLookup);
  },

  prepareCreateForm(
    domainOptions: readonly SelectOption[],
    subdomainOptions: readonly SelectOption[],
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return buildFormView(
      GAME_CATEGORY_CONFIG,
      values,
      errors,
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions },
    );
  },

  prepareEditForm(
    domainOptions: readonly SelectOption[],
    subdomainOptions: readonly SelectOption[],
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return buildFormView(
      GAME_CATEGORY_CONFIG,
      currentValues,
      errors,
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions },
    );
  },

  prepareDuplicateForm(
    domainOptions: readonly SelectOption[],
    subdomainOptions: readonly SelectOption[],
    sourceValues: Record<string, unknown>,
  ): FormView {
    const view = buildFormView(
      GAME_CATEGORY_CONFIG,
      sourceValues,
      undefined,
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions },
    );
    return { ...view, title: `Duplicate ${GAME_CATEGORY_CONFIG.displayName}` };
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(GAME_CATEGORY_CONFIG));
  },
};
