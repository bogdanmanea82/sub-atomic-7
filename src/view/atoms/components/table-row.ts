// src/view/atoms/components/table-row.ts

import type { ListViewRow } from "@view-service/types";
import { link } from "../../sub-atoms";

/**
 * Renders a table row with one <td> per field plus an actions column.
 * basePath is the URL prefix (e.g. "/game-domains") used to build edit/delete links.
 */
export function tableRow(row: ListViewRow, basePath: string): string {
  return `
    <tr data-id="${row.id}">
      ${row.fields.map((f) => `<td>${f.value}</td>`).join("")}
      <td class="actions">
        ${link("View", `${basePath}/${row.id}`)}
        ${link("Edit", `${basePath}/${row.id}/edit`, "secondary")}
        <form method="POST" action="${basePath}/${row.id}/delete" style="display:inline">
          <button type="submit" class="btn btn--danger btn--small">Delete</button>
        </form>
      </td>
    </tr>`;
}
