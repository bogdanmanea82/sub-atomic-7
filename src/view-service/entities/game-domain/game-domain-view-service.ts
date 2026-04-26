// src/view-service/entities/game-domain/game-domain-view-service.ts
// Layer 4 organism — complete view preparation interface for GameDomain

import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";
import type { ListView, DetailView, FormView, PaginationMeta, ReferenceLookup } from "../../types";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig } from "../../molecules/views";
import { buildStatusFormExtension } from "../../sub-atoms";

/**
 * Pre-binds GAME_DOMAIN_CONFIG so callers never import config directly.
 * Layer 5 views and Layer 3 controllers call this — not the molecules directly.
 */
export const GameDomainViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, GAME_DOMAIN_CONFIG, referenceLookup, pagination);
  },

  prepareDetailView(entity: Record<string, unknown>, referenceLookup?: ReferenceLookup): DetailView {
    return buildDetailView(entity, GAME_DOMAIN_CONFIG, referenceLookup);
  },

  prepareCreateForm(
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    const base = buildFormView(GAME_DOMAIN_CONFIG, values, errors);
    return { ...base, ...buildStatusFormExtension(values) };
  },

  prepareEditForm(
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    const base = buildFormView(GAME_DOMAIN_CONFIG, currentValues, errors);
    return { ...base, ...buildStatusFormExtension(currentValues) };
  },

  prepareDuplicateForm(sourceValues: Record<string, unknown>): FormView {
    const base = buildFormView(
      GAME_DOMAIN_CONFIG, sourceValues, undefined, undefined,
      `Duplicate ${GAME_DOMAIN_CONFIG.displayName}`,
    );
    return { ...base, currentState: "active" };
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(GAME_DOMAIN_CONFIG));
  },
};
