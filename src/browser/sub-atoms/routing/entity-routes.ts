// src/browser/sub-atoms/routing/entity-routes.ts
// All entity route configurations in one place.
// Adding a new entity to the browser = adding one entry here.

import type { CascadeDropdownOptions } from "../../atoms/handlers";
import type { EntityRouteConfig } from "./route-config";

// ── Cascade configs ──────────────────────────────────────────────────────

const domainToSubdomain: CascadeDropdownOptions = {
  parentSelector: '[name="game_domain_id"]',
  childSelector: '[name="game_subdomain_id"]',
  apiUrl: "/api/game-subdomains",
  filterParam: "game_domain_id",
  labelField: "name",
  valueField: "id",
  placeholder: "-- Select Subdomain --",
};

const subdomainToCategory: CascadeDropdownOptions = {
  parentSelector: '[name="game_subdomain_id"]',
  childSelector: '[name="game_category_id"]',
  apiUrl: "/api/game-categories",
  filterParam: "game_subdomain_id",
  labelField: "name",
  valueField: "id",
  placeholder: "-- Select Category --",
};

// ── Entity route configs ─────────────────────────────────────────────────

export const ENTITY_ROUTES: readonly EntityRouteConfig[] = [
  {
    basePath: "/game-domains",
    apiBasePath: "/api/game-domains",
    displayName: "Game Domain",
    checkNameUrl: "/api/game-domains/check-name",
  },
  {
    basePath: "/game-subdomains",
    apiBasePath: "/api/game-subdomains",
    displayName: "Game Subdomain",
  },
  {
    basePath: "/game-categories",
    apiBasePath: "/api/game-categories",
    displayName: "Game Category",
    cascades: [domainToSubdomain],
  },
  {
    basePath: "/game-subcategories",
    apiBasePath: "/api/game-subcategories",
    displayName: "Game Subcategory",
    cascades: [domainToSubdomain, subdomainToCategory],
    onFormInit(form: HTMLFormElement): void {
      // When domain changes, also reset the category dropdown (depends on subdomain)
      const domainSelect = form.querySelector<HTMLSelectElement>('[name="game_domain_id"]');
      const categorySelect = form.querySelector<HTMLSelectElement>('[name="game_category_id"]');
      if (domainSelect && categorySelect) {
        domainSelect.addEventListener("change", () => {
          categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
          categorySelect.value = "";
        });
      }
    },
  },
];
