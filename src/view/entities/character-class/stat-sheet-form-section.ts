// src/view/entities/character-class/stat-sheet-form-section.ts
// Renders the editable stat sheet inside character class create/edit/duplicate forms.
// Each row has a number input for base_value. L6 keeps stat_sheet_json in sync.
// Rows are grouped by category for readability.

import type { StatSheetViewRow } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";

function formatDataType(dataType: string): string {
  if (dataType === "percentage") return "%";
  if (dataType === "multiplier") return "×";
  return "";
}

function statRowHtml(row: StatSheetViewRow): string {
  const unit = formatDataType(row.stat_data_type);
  const errorHtml = row.error
    ? `<span class="field-error">${escapeHtml(row.error)}</span>`
    : "";
  return `
    <tr class="stat-sheet-row" data-stat-id="${row.stat_id}">
      <td>${escapeHtml(row.stat_name)}${unit ? `<span class="stat-unit">${unit}</span>` : ""}</td>
      <td>${row.stat_value_min}</td>
      <td>${row.stat_value_max}</td>
      <td>${row.stat_default_value}</td>
      <td>
        <input
          type="number"
          class="form-input stat-value-input"
          data-stat-id="${row.stat_id}"
          value="${row.base_value}"
          min="${row.stat_value_min}"
          max="${row.stat_value_max}"
          step="1"
        />
        ${errorHtml}
      </td>
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

export function statSheetFormSection(statSheet: readonly StatSheetViewRow[]): string {
  const initialJson = JSON.stringify(
    statSheet.map((r) => ({ stat_id: r.stat_id, base_value: r.base_value })),
  );

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
      <input type="hidden" name="stat_sheet_json" id="stat-sheet-json" value="${escapeHtml(initialJson)}" />
      <table class="stat-sheet-table">
        <thead>
          <tr>
            <th>Stat</th>
            <th>Min</th>
            <th>Max</th>
            <th>Default</th>
            <th>Base Value</th>
          </tr>
        </thead>
        <tbody id="stat-sheet-rows">
          ${categoriesHtml}
        </tbody>
      </table>
    </div>`;
}
