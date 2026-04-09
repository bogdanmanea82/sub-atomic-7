// src/view/molecules/sections/data-table.ts

import type { ListView } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";
import { tableRow, paginationControls } from "../../atoms";

/**
 * Renders a complete data table with thead, tbody, record count, and pagination.
 * basePath is passed through to tableRow for action links and pagination URLs.
 */
export function dataTable(view: ListView, basePath: string, paginationBasePath?: string): string {
  if (view.rows.length === 0) {
    return `<p class="empty-state">No ${escapeHtml(view.title)} found.</p>`;
  }

  const pagination = view.pagination
    ? paginationControls(view.pagination, paginationBasePath ?? basePath)
    : "";

  const tableClass = view.columns.length <= 5 ? "data-table data-table--compact" : "data-table";

  return `
    <div class="table-wrapper">
      <table class="${tableClass}">
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
      ${pagination}
    </div>`;
}
