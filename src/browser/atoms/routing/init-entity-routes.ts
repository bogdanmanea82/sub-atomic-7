// src/browser/atoms/routing/init-entity-routes.ts
// Matches the current URL path against an entity's route patterns
// and initializes the appropriate controller. Returns true if matched.

import type { BrowserFieldConfig } from "@config/types";
import type { EntityRouteConfig } from "../../sub-atoms/routing";
import { initFormController } from "../../organisms/controllers";
import { initDetailController } from "../../organisms/controllers";
import { initListController } from "../../organisms/controllers";
import {
  showDuplicateNotice,
  attachNameAvailabilityHandler,
  attachCascadeDropdownHandler,
} from "../handlers";

function initFormEnhancements(
  config: EntityRouteConfig,
  form: HTMLFormElement,
): void {
  if (config.cascades) {
    for (const cascade of config.cascades) {
      attachCascadeDropdownHandler(form, cascade);
    }
  }
  if (config.onFormInit) {
    config.onFormInit(form);
  }
}

export function initEntityRoutes(
  config: EntityRouteConfig,
  path: string,
  fieldConfig: readonly BrowserFieldConfig[],
): boolean {
  const { basePath, apiBasePath, displayName } = config;

  // ── Create form: /basePath/new ────────────────────────────────────────
  if (path === `${basePath}/new`) {
    initFormController({
      formSelector: ".entity-form",
      apiUrl: apiBasePath,
      method: "POST",
      redirectUrl: basePath,
      fields: fieldConfig,
      successMessage: `${displayName} created successfully`,
    });
    const form = document.querySelector<HTMLFormElement>(".entity-form");
    if (form) {
      initFormEnhancements(config, form);
      if (config.checkNameUrl) {
        attachNameAvailabilityHandler(form, {
          checkUrl: config.checkNameUrl,
          originalName: "",
          startDisabled: false,
        });
      }
    }
    return true;
  }

  // ── Duplicate form: /basePath/:id/duplicate ───────────────────────────
  const duplicateMatch = path.match(new RegExp(`^${basePath}/([^/]+)/duplicate$`));
  if (duplicateMatch) {
    showDuplicateNotice();
    initFormController({
      formSelector: ".entity-form",
      apiUrl: apiBasePath,
      method: "POST",
      redirectUrl: basePath,
      fields: fieldConfig,
      successMessage: `${displayName} duplicated successfully`,
    });
    const form = document.querySelector<HTMLFormElement>(".entity-form");
    if (form) {
      initFormEnhancements(config, form);
      if (config.checkNameUrl) {
        const nameInput = form.querySelector<HTMLInputElement>('[name="name"]');
        attachNameAvailabilityHandler(form, {
          checkUrl: config.checkNameUrl,
          originalName: nameInput?.value ?? "",
          startDisabled: true,
        });
      }
    }
    return true;
  }

  // ── Edit form: /basePath/:id/edit ─────────────────────────────────────
  const editMatch = path.match(new RegExp(`^${basePath}/([^/]+)/edit$`));
  if (editMatch) {
    const id = editMatch[1] as string;
    initFormController({
      formSelector: ".entity-form",
      apiUrl: `${apiBasePath}/${id}`,
      method: "PUT",
      redirectUrl: `${basePath}/${id}`,
      fields: fieldConfig,
      successMessage: `${displayName} updated successfully`,
    });
    const form = document.querySelector<HTMLFormElement>(".entity-form");
    if (form) {
      initFormEnhancements(config, form);
      if (config.checkNameUrl) {
        const nameInput = form.querySelector<HTMLInputElement>('[name="name"]');
        attachNameAvailabilityHandler(form, {
          checkUrl: config.checkNameUrl,
          originalName: nameInput?.value ?? "",
          excludeId: id,
          startDisabled: false,
        });
      }
    }
    return true;
  }

  // ── Detail: /basePath/:id ─────────────────────────────────────────────
  const detailMatch = path.match(new RegExp(`^${basePath}/([^/]+)$`));
  if (detailMatch) {
    const id = detailMatch[1] as string;
    initDetailController({
      deleteFormSelector: "form[action$='/delete']",
      apiUrl: `${apiBasePath}/${id}`,
      entityName: document.querySelector("h1")?.textContent ?? "this record",
      redirectUrl: basePath,
    });
    if (config.onDetailInit) {
      config.onDetailInit();
    }
    return true;
  }

  // ── List: /basePath ───────────────────────────────────────────────────
  if (path === basePath) {
    initListController({
      tableSelector: ".data-table",
      rowSelector: ".data-table tbody tr",
      apiBasePath: apiBasePath,
      redirectUrl: basePath,
    });
    if (config.onListInit) {
      config.onListInit();
    }
    return true;
  }

  return false;
}
