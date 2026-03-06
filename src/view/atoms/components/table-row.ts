// src/view/atoms/components/table-row.ts

import type { ListViewRow } from "@view-service/types";
import { link, deleteForm } from "../../sub-atoms";

/**
 * Renders a table row with one <td> per field plus an actions column.
 * basePath is the URL prefix (e.g. "/game-domains") used to build edit/delete links.
 */
export function tableRow(row: ListViewRow, basePath: string): string {
  return `
    <tr data-id="${row.id}">
      ${row.fields.map((f) => `<td>${f.value}</td>`).join("")}
      <td class="actions">
        ${link("View", `${basePath}/${row.id}`, "default", "👁")}
        ${link("Edit", `${basePath}/${row.id}/edit`, "secondary", "✏️")}
        ${link("Duplicate", `${basePath}/${row.id}/duplicate`, "secondary", "📋")}
        ${deleteForm(`${basePath}/${row.id}/delete`, "Delete", true)}
      </td>
    </tr>`;
}
