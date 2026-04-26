// src/view/entities/item/stat-sheet-form-section.ts
// Renders the editable stat sheet inside item create/edit/duplicate forms.
// All stats shown with 0 as default. Zero values are filtered by the service
// before insert, so only explicitly-set stats are persisted.

import type { ItemStatBaseViewRow } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";

function formatDataType(dataType: string): string {
  if (dataType === "percentage") return "%";
  if (dataType === "multiplier") return "×";
  return "";
}

function statRowHtml(row: ItemStatBaseViewRow): string {
  const unit = formatDataType(row.stat_data_type);
  const errorHtml = row.error
    ? `<span class="field-error">${escapeHtml(row.error)}</span>`
    : "";
  return `
    <tr class="stat-sheet-row" data-stat-id="${row.stat_id}">
      <td>${escapeHtml(row.stat_name)}${unit ? `<span class="stat-unit">${unit}</span>` : ""}</td>
      <td>${row.stat_value_min}</td>
      <td>${row.stat_value_max}</td>
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

function categoryGroupHtml(category: string, rows: ItemStatBaseViewRow[]): string {
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return `
    <tr class="stat-sheet-category-row">
      <td colspan="4"><strong>${escapeHtml(label)}</strong></td>
    </tr>
    ${rows.map((r) => statRowHtml(r)).join("")}`;
}

export function statSheetFormSection(statSheet: readonly ItemStatBaseViewRow[]): string {
  const initialJson = JSON.stringify(
    statSheet.map((r) => ({ stat_id: r.stat_id, base_value: r.base_value })),
  );

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
      <p class="stat-sheet-hint">Set values for stats this item provides. Leave at 0 to omit.</p>
      <input type="hidden" name="stat_sheet_json" id="stat-sheet-json" value="${escapeHtml(initialJson)}" />
      <table class="stat-sheet-table">
        <thead>
          <tr>
            <th>Stat</th>
            <th>Min</th>
            <th>Max</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody id="stat-sheet-rows">
          ${categoriesHtml}
        </tbody>
      </table>
    </div>`;
}
