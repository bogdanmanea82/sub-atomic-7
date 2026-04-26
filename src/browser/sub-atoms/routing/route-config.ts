// src/browser/sub-atoms/routing/route-config.ts
// Data type for entity route configuration.
// Each entity in the app has one config — main.ts loops over them to initialize.

import type { CascadeDropdownOptions } from "../../atoms/handlers";

export interface EntityRouteConfig {
  /** URL path prefix, e.g. "/game-domains" */
  readonly basePath: string;
  /** API path prefix, e.g. "/api/game-domains" */
  readonly apiBasePath: string;
  /** Human-readable entity name, e.g. "Game Domain" */
  readonly displayName: string;
  /** URL for check-name uniqueness API, if the entity supports it */
  readonly checkNameUrl?: string;
  /** URL for check-machine-name uniqueness API, if the entity supports it */
  readonly checkMachineNameUrl?: string;
  /** Cascade dropdown configs to attach on form pages */
  readonly cascades?: readonly CascadeDropdownOptions[];
  /** Extra form initialization hook (e.g. subcategory domain→category reset) */
  readonly onFormInit?: (form: HTMLFormElement) => void;
  /** Extra detail page initialization hook (e.g. tab switching) */
  readonly onDetailInit?: () => void;
  /** Extra list page initialization hook (e.g. filter dropdowns) */
  readonly onListInit?: () => void;
}
