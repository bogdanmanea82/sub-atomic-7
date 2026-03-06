// src/view-service/entities/game-domain/game-domain-view-service.ts
// Layer 4 organism — complete view preparation interface for GameDomain

import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";
import type { ListView, DetailView, FormView } from "../../types";
import { buildListView, buildDetailView, buildFormView } from "../../molecules/views";

/**
 * Pre-binds GAME_DOMAIN_CONFIG so callers never import config directly.
 * Layer 5 views and Layer 3 controllers call this — not the molecules directly.
 */
export const GameDomainViewService = {
  prepareListView(entities: Record<string, unknown>[]): ListView {
    return buildListView(entities, GAME_DOMAIN_CONFIG);
  },

  prepareDetailView(entity: Record<string, unknown>): DetailView {
    return buildDetailView(entity, GAME_DOMAIN_CONFIG);
  },

  prepareCreateForm(): FormView {
    return buildFormView(GAME_DOMAIN_CONFIG);
  },

  prepareEditForm(currentValues: Record<string, unknown>): FormView {
    return buildFormView(GAME_DOMAIN_CONFIG, currentValues);
  },
};
