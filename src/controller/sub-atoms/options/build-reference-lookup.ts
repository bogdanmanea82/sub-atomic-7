// src/controller/sub-atoms/options/build-reference-lookup.ts
// Converts option arrays into a lookup map keyed by field name.
// Used by list and detail pages to resolve UUID foreign keys to display names.

import type { SelectOption, ReferenceLookup } from "@view-service/types";

/**
 * Builds a ReferenceLookup from an array of field-options entries.
 * Each entry maps a field name to its SelectOption[] → { value: label } map.
 */
export function buildReferenceLookup(
  entries: ReadonlyArray<{ fieldName: string; options: readonly SelectOption[] }>,
): ReferenceLookup {
  const lookup: Record<string, Record<string, string>> = {};
  for (const { fieldName, options } of entries) {
    const map: Record<string, string> = {};
    for (const opt of options) {
      map[opt.value] = opt.label;
    }
    lookup[fieldName] = map;
  }
  return lookup;
}
