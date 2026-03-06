// src/browser/main.ts
// Entry point for browser-side JavaScript.
// Detects the current page from the URL and initializes the right controller.
// This script is loaded on every page via a <script> tag in the main layout.

import type { BrowserFieldConfig } from "@config/types";
import { consumeFlashMessage } from "./sub-atoms/utilities";
import { showToast } from "./molecules/ui";
import { ENTITY_ROUTES } from "./sub-atoms/routing";
import { initEntityRoutes } from "./atoms/routing";

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

function init(): void {
  // Show any flash message stored before a redirect (create, update, delete)
  const flash = consumeFlashMessage();
  if (flash) {
    showToast(flash.message, flash.type);
  }

  const path = window.location.pathname;
  const fieldConfig = readFieldConfig();

  for (const route of ENTITY_ROUTES) {
    if (initEntityRoutes(route, path, fieldConfig)) return;
  }
}

document.addEventListener("DOMContentLoaded", init);
