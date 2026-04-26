// src/view/entities/item/stat-sheet-detail-section.ts
// Renders the read-only implicit stat sheet on the item detail page.
// Shows only the stats that have been explicitly set (non-zero rows).

import type { ItemStatBaseViewRow } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";

function formatDataType(dataType: string): string {
  if (dataType === "percentage") return "%";
  if (dataType === "multiplier") return "×";
  return "";
}

function statRowHtml(row: ItemStatBaseViewRow): string {
  const unit = formatDataType(row.stat_data_type);
  return `
    <tr class="stat-sheet-row">
      <td>${escapeHtml(row.stat_name)}${unit ? `<span class="stat-unit">${unit}</span>` : ""}</td>
      <td>${escapeHtml(row.combination_type)}</td>
      <td><strong>${row.base_value}</strong></td>
      <td>${row.stat_value_min}</td>
      <td>${row.stat_value_max}</td>
    </tr>`;
}

function categoryGroupHtml(category: string, rows: ItemStatBaseViewRow[]): string {
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return `
    <tr class="stat-sheet-category-row">
      <td colspan="5"><strong>${escapeHtml(label)}</strong></td>
    </tr>
    ${rows.map((r) => statRowHtml(r)).join("")}`;
}

export function statSheetDetailSection(statSheet: readonly ItemStatBaseViewRow[]): string {
  if (statSheet.length === 0) {
    return `<div class="stat-sheet-section"><h3>Implicit Stats</h3><p>No implicit stats set.</p></div>`;
  }

  const grouped = new Map<string, ItemStatBaseViewRow[]>();
  for (const row of statSheet) {
    const cat = row.stat_category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(row);
  }

  const categoriesHtml = [...grouped.entries()]
    .map(([cat, rows]) => categoryGroupHtml(cat, rows))
    .join("");

  return `
    <div class="stat-sheet-section" id="stat-sheet-section">
      <h3>Implicit Stats</h3>
      <table class="stat-sheet-table">
        <thead>
          <tr>
            <th>Stat</th>
            <th>Combination</th>
            <th>Value</th>
            <th>Min</th>
            <th>Max</th>
          </tr>
        </thead>
        <tbody>
          ${categoriesHtml}
        </tbody>
      </table>
    </div>`;
}
