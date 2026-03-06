// src/view-service/molecules/views/build-browser-field-config.ts
// Converts Layer 0 FieldConfig into a minimal JSON array for browser-side validation.
// The browser reads this from an embedded <script> tag — no hardcoded mirror needed.

import type { EntityConfig, BrowserFieldConfig } from "@config/types";

/**
 * Extracts the browser-relevant subset from entity config fields.
 * Excludes auto-managed fields (UUID, timestamps) since the browser
 * never validates those — they're set by the server.
 */
export function buildBrowserFieldConfig(config: EntityConfig): BrowserFieldConfig[] {
  return config.fields
    .filter((f) => f.type !== "uuid" && f.type !== "timestamp")
    .map((field) => {
      const base: BrowserFieldConfig = {
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required,
      };

      if (field.type === "string") {
        return { ...base, minLength: field.minLength, maxLength: field.maxLength, pattern: field.pattern };
      }

      if (field.type === "integer") {
        return { ...base, min: field.min, max: field.max };
      }

      return base;
    });
}
