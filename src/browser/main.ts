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
import { showDuplicateNotice, attachNameAvailabilityHandler } from "./atoms/handlers";

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
}

document.addEventListener("DOMContentLoaded", init);
