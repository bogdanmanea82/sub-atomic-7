// src/view-service/molecules/views/build-filtered-list-view.ts
// Removes named columns and their corresponding row fields from a ListView.
// Used by entity view-services that replace certain columns with filter dropdowns.

import type { ListView } from "../../types";

export function buildFilteredListView(view: ListView, excludeFields: Set<string>): ListView {
  return {
    ...view,
    columns: view.columns.filter((c) => !excludeFields.has(c.name)),
    rows: view.rows.map((r) => ({
      ...r,
      fields: r.fields.filter((f) => !excludeFields.has(f.name)),
    })),
  };
}
