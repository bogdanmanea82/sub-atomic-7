// src/view/entities/character-class/stat-sheet-detail-section.ts
// Renders the read-only stat sheet on the character class detail page.
// Rows are grouped by category, showing base_value alongside range reference.

import type { StatSheetViewRow } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";

function formatDataType(dataType: string): string {
  if (dataType === "percentage") return "%";
  if (dataType === "multiplier") return "×";
  return "";
}

function statRowHtml(row: StatSheetViewRow): string {
  const unit = formatDataType(row.stat_data_type);
  return `
    <tr class="stat-sheet-row">
      <td>${escapeHtml(row.stat_name)}${unit ? `<span class="stat-unit">${unit}</span>` : ""}</td>
      <td><strong>${row.base_value}</strong></td>
      <td>${row.stat_value_min}</td>
      <td>${row.stat_value_max}</td>
      <td>${row.stat_default_value}</td>
    </tr>`;
}

function categoryGroupHtml(category: string, rows: StatSheetViewRow[]): string {
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return `
    <tr class="stat-sheet-category-row">
      <td colspan="5"><strong>${escapeHtml(label)}</strong></td>
    </tr>
    ${rows.map((r) => statRowHtml(r)).join("")}`;
}

export function statSheetDetailSection(statSheet: readonly StatSheetViewRow[]): string {
  if (statSheet.length === 0) {
    return `<div class="stat-sheet-section"><p>No stat sheet data.</p></div>`;
  }

  const grouped = new Map<string, StatSheetViewRow[]>();
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
      <h3>Stat Sheet</h3>
      <table class="stat-sheet-table">
        <thead>
          <tr>
            <th>Stat</th>
            <th>Base Value</th>
            <th>Min</th>
            <th>Max</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          ${categoriesHtml}
        </tbody>
      </table>
    </div>`;
}
