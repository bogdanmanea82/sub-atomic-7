// src/browser/main.ts
// Entry point for browser-side JavaScript.
// Detects the current page from the URL and initializes the right controller.
// This script is loaded on every page via a <script> tag in the main layout.

import type { BrowserFieldConfig } from "./organisms/controllers";
import { initListController } from "./organisms/controllers";
import { initFormController } from "./organisms/controllers";
import { initDetailController } from "./organisms/controllers";
import { consumeFlashMessage } from "./sub-atoms/utilities";
import { showToast } from "./molecules/ui";
import { showDuplicateNotice, attachNameAvailabilityHandler, attachCascadeDropdownHandler } from "./atoms/handlers";

/**
 * Reads field config from the embedded <script id="field-config"> tag.
 * The server renders this JSON from Layer 0 config — no hardcoded mirror needed.
 * Returns an empty array if the tag is missing (non-form pages).
 */
function readFieldConfig(): readonly BrowserFieldConfig[] {
  const el = document.getElementById("field-config");
  if (!el?.textContent) return [];
  try {
    return JSON.parse(el.textContent) as BrowserFieldConfig[];
  } catch {
    return [];
  }
}

// ── Page detection and initialization ──────────────────────────────────────
// Uses the URL path to determine which page is loaded.
// Each route pattern maps to a controller with the right options.

function init(): void {
  // Show any flash message stored before a redirect (create, update, delete)
  const flash = consumeFlashMessage();
  if (flash) {
    showToast(flash.message, flash.type);
  }

  const path = window.location.pathname;

  // /game-domains/new — create form
  if (path === "/game-domains/new") {
    initFormController({
      formSelector: ".entity-form",
      apiUrl: "/api/game-domains",
      method: "POST",
      redirectUrl: "/game-domains",
      fields: readFieldConfig(),
      successMessage: "Game Domain created successfully",
    });

    // Check name uniqueness as the user types
    const createForm = document.querySelector<HTMLFormElement>(".entity-form");
    if (createForm) {
      attachNameAvailabilityHandler(createForm, {
        checkUrl: "/api/game-domains/check-name",
        originalName: "",
        startDisabled: false,
      });
    }
    return;
  }

  // /game-domains/:id/duplicate — duplicate form (pre-filled create)
  const duplicateMatch = path.match(/^\/game-domains\/([^/]+)\/duplicate$/);
  if (duplicateMatch) {
    showDuplicateNotice();
    initFormController({
      formSelector: ".entity-form",
      apiUrl: "/api/game-domains",
      method: "POST",
      redirectUrl: "/game-domains",
      fields: readFieldConfig(),
      successMessage: "Game Domain duplicated successfully",
    });

    // Disable Save until the name is changed to something unique
    const dupForm = document.querySelector<HTMLFormElement>(".entity-form");
    if (dupForm) {
      const nameInput = dupForm.querySelector<HTMLInputElement>('[name="name"]');
      attachNameAvailabilityHandler(dupForm, {
        checkUrl: "/api/game-domains/check-name",
        originalName: nameInput?.value ?? "",
        startDisabled: true,
      });
    }
    return;
  }

  // /game-domains/:id/edit — edit form
  const editMatch = path.match(/^\/game-domains\/([^/]+)\/edit$/);
  if (editMatch) {
    const id = editMatch[1] as string;
    initFormController({
      formSelector: ".entity-form",
      apiUrl: `/api/game-domains/${id}`,
      method: "PUT",
      redirectUrl: `/game-domains/${id}`,
      fields: readFieldConfig(),
      successMessage: "Game Domain updated successfully",
    });

    // Check name uniqueness on edit (excludes current record)
    const editForm = document.querySelector<HTMLFormElement>(".entity-form");
    if (editForm) {
      const nameInput = editForm.querySelector<HTMLInputElement>('[name="name"]');
      attachNameAvailabilityHandler(editForm, {
        checkUrl: "/api/game-domains/check-name",
        originalName: nameInput?.value ?? "",
        excludeId: id,
        startDisabled: false,
      });
    }
    return;
  }

  // /game-domains/:id — detail page
  const detailMatch = path.match(/^\/game-domains\/([^/]+)$/);
  if (detailMatch) {
    const id = detailMatch[1] as string;
    initDetailController({
      deleteFormSelector: "form[action$='/delete']",
      apiUrl: `/api/game-domains/${id}`,
      entityName: document.querySelector("h1")?.textContent ?? "this record",
      redirectUrl: "/game-domains",
    });
    return;
  }

  // /game-domains — list page
  if (path === "/game-domains") {
    initListController({
      tableSelector: ".data-table",
      rowSelector: ".data-table tbody tr",
      apiBasePath: "/api/game-domains",
      redirectUrl: "/game-domains",
    });
    return;
  }

  // ── Game Subdomains ────────────────────────────────────────────────────

  // /game-subdomains/new — create form
  if (path === "/game-subdomains/new") {
    initFormController({
      formSelector: ".entity-form",
      apiUrl: "/api/game-subdomains",
      method: "POST",
      redirectUrl: "/game-subdomains",
      fields: readFieldConfig(),
      successMessage: "Game Subdomain created successfully",
    });
    return;
  }

  // /game-subdomains/:id/duplicate
  const subDuplicateMatch = path.match(/^\/game-subdomains\/([^/]+)\/duplicate$/);
  if (subDuplicateMatch) {
    showDuplicateNotice();
    initFormController({
      formSelector: ".entity-form",
      apiUrl: "/api/game-subdomains",
      method: "POST",
      redirectUrl: "/game-subdomains",
      fields: readFieldConfig(),
      successMessage: "Game Subdomain duplicated successfully",
    });
    return;
  }

  // /game-subdomains/:id/edit
  const subEditMatch = path.match(/^\/game-subdomains\/([^/]+)\/edit$/);
  if (subEditMatch) {
    const id = subEditMatch[1] as string;
    initFormController({
      formSelector: ".entity-form",
      apiUrl: `/api/game-subdomains/${id}`,
      method: "PUT",
      redirectUrl: `/game-subdomains/${id}`,
      fields: readFieldConfig(),
      successMessage: "Game Subdomain updated successfully",
    });
    return;
  }

  // /game-subdomains/:id — detail page
  const subDetailMatch = path.match(/^\/game-subdomains\/([^/]+)$/);
  if (subDetailMatch) {
    const id = subDetailMatch[1] as string;
    initDetailController({
      deleteFormSelector: "form[action$='/delete']",
      apiUrl: `/api/game-subdomains/${id}`,
      entityName: document.querySelector("h1")?.textContent ?? "this record",
      redirectUrl: "/game-subdomains",
    });
    return;
  }

  // /game-subdomains — list page
  if (path === "/game-subdomains") {
    initListController({
      tableSelector: ".data-table",
      rowSelector: ".data-table tbody tr",
      apiBasePath: "/api/game-subdomains",
      redirectUrl: "/game-subdomains",
    });
    return;
  }

  // ── Game Categories ──────────────────────────────────────────────────

  /** Shared cascade config: domain dropdown filters the subdomain dropdown */
  const categoryCascadeOptions = {
    parentSelector: '[name="game_domain_id"]',
    childSelector: '[name="game_subdomain_id"]',
    apiUrl: "/api/game-subdomains",
    filterParam: "game_domain_id",
    labelField: "name",
    valueField: "id",
    placeholder: "-- Select Subdomain --",
  };

  // /game-categories/new — create form with cascading dropdown
  if (path === "/game-categories/new") {
    initFormController({
      formSelector: ".entity-form",
      apiUrl: "/api/game-categories",
      method: "POST",
      redirectUrl: "/game-categories",
      fields: readFieldConfig(),
      successMessage: "Game Category created successfully",
    });
    const catForm = document.querySelector<HTMLFormElement>(".entity-form");
    if (catForm) {
      attachCascadeDropdownHandler(catForm, categoryCascadeOptions);
    }
    return;
  }

  // /game-categories/:id/duplicate
  const catDuplicateMatch = path.match(/^\/game-categories\/([^/]+)\/duplicate$/);
  if (catDuplicateMatch) {
    showDuplicateNotice();
    initFormController({
      formSelector: ".entity-form",
      apiUrl: "/api/game-categories",
      method: "POST",
      redirectUrl: "/game-categories",
      fields: readFieldConfig(),
      successMessage: "Game Category duplicated successfully",
    });
    const dupForm = document.querySelector<HTMLFormElement>(".entity-form");
    if (dupForm) {
      attachCascadeDropdownHandler(dupForm, categoryCascadeOptions);
    }
    return;
  }

  // /game-categories/:id/edit
  const catEditMatch = path.match(/^\/game-categories\/([^/]+)\/edit$/);
  if (catEditMatch) {
    const id = catEditMatch[1] as string;
    initFormController({
      formSelector: ".entity-form",
      apiUrl: `/api/game-categories/${id}`,
      method: "PUT",
      redirectUrl: `/game-categories/${id}`,
      fields: readFieldConfig(),
      successMessage: "Game Category updated successfully",
    });
    const editForm = document.querySelector<HTMLFormElement>(".entity-form");
    if (editForm) {
      attachCascadeDropdownHandler(editForm, categoryCascadeOptions);
    }
    return;
  }

  // /game-categories/:id — detail page
  const catDetailMatch = path.match(/^\/game-categories\/([^/]+)$/);
  if (catDetailMatch) {
    const id = catDetailMatch[1] as string;
    initDetailController({
      deleteFormSelector: "form[action$='/delete']",
      apiUrl: `/api/game-categories/${id}`,
      entityName: document.querySelector("h1")?.textContent ?? "this record",
      redirectUrl: "/game-categories",
    });
    return;
  }

  // /game-categories — list page
  if (path === "/game-categories") {
    initListController({
      tableSelector: ".data-table",
      rowSelector: ".data-table tbody tr",
      apiBasePath: "/api/game-categories",
      redirectUrl: "/game-categories",
    });
    return;
  }

  // ── Game Subcategories ───────────────────────────────────────────────

  /** Cascade config for subcategory forms: domain→subdomain, subdomain→category */
  const subcatDomainToSubdomain = {
    parentSelector: '[name="game_domain_id"]',
    childSelector: '[name="game_subdomain_id"]',
    apiUrl: "/api/game-subdomains",
    filterParam: "game_domain_id",
    labelField: "name",
    valueField: "id",
    placeholder: "-- Select Subdomain --",
  };

  const subcatSubdomainToCategory = {
    parentSelector: '[name="game_subdomain_id"]',
    childSelector: '[name="game_category_id"]',
    apiUrl: "/api/game-categories",
    filterParam: "game_subdomain_id",
    labelField: "name",
    valueField: "id",
    placeholder: "-- Select Category --",
  };

  /** Attaches both cascade handlers and clears downstream dropdowns on parent change */
  function attachSubcategoryCascades(form: HTMLFormElement): void {
    attachCascadeDropdownHandler(form, subcatDomainToSubdomain);
    attachCascadeDropdownHandler(form, subcatSubdomainToCategory);

    // When domain changes, also reset the category dropdown (it depends on subdomain)
    const domainSelect = form.querySelector<HTMLSelectElement>('[name="game_domain_id"]');
    const categorySelect = form.querySelector<HTMLSelectElement>('[name="game_category_id"]');
    if (domainSelect && categorySelect) {
      domainSelect.addEventListener("change", () => {
        categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
        categorySelect.value = "";
      });
    }
  }

  // /game-subcategories/new
  if (path === "/game-subcategories/new") {
    initFormController({
      formSelector: ".entity-form",
      apiUrl: "/api/game-subcategories",
      method: "POST",
      redirectUrl: "/game-subcategories",
      fields: readFieldConfig(),
      successMessage: "Game Subcategory created successfully",
    });
    const form = document.querySelector<HTMLFormElement>(".entity-form");
    if (form) attachSubcategoryCascades(form);
    return;
  }

  // /game-subcategories/:id/duplicate
  const subcatDuplicateMatch = path.match(/^\/game-subcategories\/([^/]+)\/duplicate$/);
  if (subcatDuplicateMatch) {
    showDuplicateNotice();
    initFormController({
      formSelector: ".entity-form",
      apiUrl: "/api/game-subcategories",
      method: "POST",
      redirectUrl: "/game-subcategories",
      fields: readFieldConfig(),
      successMessage: "Game Subcategory duplicated successfully",
    });
    const form = document.querySelector<HTMLFormElement>(".entity-form");
    if (form) attachSubcategoryCascades(form);
    return;
  }

  // /game-subcategories/:id/edit
  const subcatEditMatch = path.match(/^\/game-subcategories\/([^/]+)\/edit$/);
  if (subcatEditMatch) {
    const id = subcatEditMatch[1] as string;
    initFormController({
      formSelector: ".entity-form",
      apiUrl: `/api/game-subcategories/${id}`,
      method: "PUT",
      redirectUrl: `/game-subcategories/${id}`,
      fields: readFieldConfig(),
      successMessage: "Game Subcategory updated successfully",
    });
    const form = document.querySelector<HTMLFormElement>(".entity-form");
    if (form) attachSubcategoryCascades(form);
    return;
  }

  // /game-subcategories/:id — detail page
  const subcatDetailMatch = path.match(/^\/game-subcategories\/([^/]+)$/);
  if (subcatDetailMatch) {
    const id = subcatDetailMatch[1] as string;
    initDetailController({
      deleteFormSelector: "form[action$='/delete']",
      apiUrl: `/api/game-subcategories/${id}`,
      entityName: document.querySelector("h1")?.textContent ?? "this record",
      redirectUrl: "/game-subcategories",
    });
    return;
  }

  // /game-subcategories — list page
  if (path === "/game-subcategories") {
    initListController({
      tableSelector: ".data-table",
      rowSelector: ".data-table tbody tr",
      apiBasePath: "/api/game-subcategories",
      redirectUrl: "/game-subcategories",
    });
    return;
  }
}

document.addEventListener("DOMContentLoaded", init);
