// src/browser/sub-atoms/routing/entity-routes.ts
// All entity route configurations in one place.
// Adding a new entity to the browser = adding one entry here.

import type { CascadeDropdownOptions } from "../../atoms/handlers";
import { attachCascadeDropdownHandler, attachTierHandlers, attachTabSwitchHandler, attachBindingHandler, attachTierDetailHandler, attachStatSheetHandler } from "../../atoms/handlers";
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

const categoryToSubcategory: CascadeDropdownOptions = {
  parentSelector: '[name="game_category_id"]',
  childSelector: '[name="game_subcategory_id"]',
  apiUrl: "/api/game-subcategories",
  filterParam: "game_category_id",
  labelField: "name",
  valueField: "id",
  placeholder: "-- Select Subcategory --",
};

// ── Filter cascade configs (modifier list page) ─────────────────────────

const filterDomainToSubdomain: CascadeDropdownOptions = {
  parentSelector: "#filter_game_domain_id",
  childSelector: "#filter_game_subdomain_id",
  apiUrl: "/api/game-subdomains",
  filterParam: "game_domain_id",
  labelField: "name",
  valueField: "id",
  placeholder: "All Subdomains",
};

const filterSubdomainToCategory: CascadeDropdownOptions = {
  parentSelector: "#filter_game_subdomain_id",
  childSelector: "#filter_game_category_id",
  apiUrl: "/api/game-categories",
  filterParam: "game_subdomain_id",
  labelField: "name",
  valueField: "id",
  placeholder: "All Categories",
};

const filterCategoryToSubcategory: CascadeDropdownOptions = {
  parentSelector: "#filter_game_category_id",
  childSelector: "#filter_game_subcategory_id",
  apiUrl: "/api/game-subcategories",
  filterParam: "game_category_id",
  labelField: "name",
  valueField: "id",
  placeholder: "All Subcategories",
};

// ── Entity route configs ─────────────────────────────────────────────────

export const ENTITY_ROUTES: readonly EntityRouteConfig[] = [
  {
    basePath: "/game-domains",
    apiBasePath: "/api/game-domains",
    displayName: "Game Domain",
    checkNameUrl: "/api/game-domains/check-name",
    checkMachineNameUrl: "/api/game-domains/check-machine-name",
  },
  {
    basePath: "/game-subdomains",
    apiBasePath: "/api/game-subdomains",
    displayName: "Game Subdomain",
    checkNameUrl: "/api/game-subdomains/check-name",
    checkMachineNameUrl: "/api/game-subdomains/check-machine-name",
  },
  {
    basePath: "/game-categories",
    apiBasePath: "/api/game-categories",
    displayName: "Game Category",
    checkNameUrl: "/api/game-categories/check-name",
    checkMachineNameUrl: "/api/game-categories/check-machine-name",
    cascades: [domainToSubdomain],
    onListInit(): void {
      const filterForm = document.querySelector<HTMLFormElement>(".filter-bar");
      if (!filterForm) return;
      attachCascadeDropdownHandler(filterForm, filterDomainToSubdomain);
    },
  },
  {
    basePath: "/game-subcategories",
    apiBasePath: "/api/game-subcategories",
    displayName: "Game Subcategory",
    checkNameUrl: "/api/game-subcategories/check-name",
    checkMachineNameUrl: "/api/game-subcategories/check-machine-name",
    cascades: [domainToSubdomain, subdomainToCategory],
    onListInit(): void {
      const filterForm = document.querySelector<HTMLFormElement>(".filter-bar");
      if (!filterForm) return;
      attachCascadeDropdownHandler(filterForm, filterDomainToSubdomain);
      attachCascadeDropdownHandler(filterForm, filterSubdomainToCategory);

      // When domain changes, also reset category filter
      const domainSelect = filterForm.querySelector<HTMLSelectElement>("#filter_game_domain_id");
      const categorySelect = filterForm.querySelector<HTMLSelectElement>("#filter_game_category_id");
      if (domainSelect && categorySelect) {
        domainSelect.addEventListener("change", () => {
          categorySelect.innerHTML = '<option value="">All Categories</option>';
        });
      }
    },
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
  {
    basePath: "/stats",
    apiBasePath: "/api/stats",
    displayName: "Stat",
    checkNameUrl: "/api/stats/check-name",
    checkMachineNameUrl: "/api/stats/check-machine-name",
  },
  {
    basePath: "/character-classes",
    apiBasePath: "/api/character-classes",
    displayName: "Character Class",
    checkNameUrl: "/api/character-classes/check-name",
    checkMachineNameUrl: "/api/character-classes/check-machine-name",
    onFormInit(form: HTMLFormElement): void {
      attachStatSheetHandler(form);
    },
  },
  {
    basePath: "/modifiers",
    apiBasePath: "/api/modifiers",
    displayName: "Modifier",
    checkNameUrl: "/api/modifiers/check-name",
    checkMachineNameUrl: "/api/modifiers/check-machine-name",
    cascades: [domainToSubdomain, subdomainToCategory, categoryToSubcategory],
    onListInit(): void {
      const filterForm = document.querySelector<HTMLFormElement>(".filter-bar");
      if (!filterForm) return;
      attachCascadeDropdownHandler(filterForm, filterDomainToSubdomain);
      attachCascadeDropdownHandler(filterForm, filterSubdomainToCategory);
      attachCascadeDropdownHandler(filterForm, filterCategoryToSubcategory);

      // When domain changes, also reset category and subcategory filters
      const domainSelect = filterForm.querySelector<HTMLSelectElement>("#filter_game_domain_id");
      const categorySelect = filterForm.querySelector<HTMLSelectElement>("#filter_game_category_id");
      const subcategorySelect = filterForm.querySelector<HTMLSelectElement>("#filter_game_subcategory_id");
      if (domainSelect && categorySelect) {
        domainSelect.addEventListener("change", () => {
          categorySelect.innerHTML = '<option value="">All Categories</option>';
          if (subcategorySelect) {
            subcategorySelect.innerHTML = '<option value="">All Subcategories</option>';
          }
        });
      }

      // When subdomain changes, also reset subcategory filter
      const subdomainSelect = filterForm.querySelector<HTMLSelectElement>("#filter_game_subdomain_id");
      if (subdomainSelect && subcategorySelect) {
        subdomainSelect.addEventListener("change", () => {
          subcategorySelect.innerHTML = '<option value="">All Subcategories</option>';
        });
      }
    },
    onDetailInit(): void {
      attachTabSwitchHandler();
      attachBindingHandler();
      attachTierDetailHandler();
    },
    onFormInit(form: HTMLFormElement): void {
      const domainSelect = form.querySelector<HTMLSelectElement>('[name="game_domain_id"]');
      const subdomainSelect = form.querySelector<HTMLSelectElement>('[name="game_subdomain_id"]');
      const categorySelect = form.querySelector<HTMLSelectElement>('[name="game_category_id"]');
      const subcategorySelect = form.querySelector<HTMLSelectElement>('[name="game_subcategory_id"]');

      // When domain changes, also reset category and subcategory
      if (domainSelect && categorySelect) {
        domainSelect.addEventListener("change", () => {
          categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
          categorySelect.value = "";
          if (subcategorySelect) {
            subcategorySelect.innerHTML = '<option value="">-- Select Subcategory --</option>';
            subcategorySelect.value = "";
          }
        });
      }

      // When subdomain changes, also reset subcategory
      if (subdomainSelect && subcategorySelect) {
        subdomainSelect.addEventListener("change", () => {
          subcategorySelect.innerHTML = '<option value="">-- Select Subcategory --</option>';
          subcategorySelect.value = "";
        });
      }

      // Attach tier row management handlers
      attachTierHandlers(form);

      // Attach tab switching and binding handler (edit page has tabs too)
      attachTabSwitchHandler();
      attachBindingHandler();
    },
  },
];
