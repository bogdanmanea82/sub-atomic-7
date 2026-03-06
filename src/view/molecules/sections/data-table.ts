// src/view/molecules/sections/data-table.ts

import type { ListView } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";
import { tableRow } from "../../atoms";

/**
 * Renders a complete data table with thead, tbody, and row count.
 * basePath is passed through to tableRow for building action links.
 */
export function dataTable(view: ListView, basePath: string): string {
  if (view.rows.length === 0) {
    return `<p class="empty-state">No ${escapeHtml(view.title)} found.</p>`;
  }

  return `
    <div class="table-wrapper">
      <p class="record-count">${view.count} record${view.count === 1 ? "" : "s"}</p>
      <table class="data-table">
        <thead>
          <tr>
            ${view.columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join("")}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${view.rows.map((row) => tableRow(row, basePath)).join("")}
        </tbody>
      </table>
    </div>`;
}
