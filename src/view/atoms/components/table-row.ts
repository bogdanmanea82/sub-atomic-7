// src/view/atoms/components/table-row.ts

import type { ListViewRow } from "@view-service/types";
import { link, deleteForm, ICON_VIEW, ICON_EDIT, ICON_COPY, escapeHtml } from "../../sub-atoms";

/**
 * Renders a table row with one <td> per field plus an actions column.
 * basePath is the URL prefix (e.g. "/game-domains") used to build edit/delete links.
 * First column is rendered as a clickable link to the detail page; its title shows description.
 * is_active column shows a simple active/inactive status dot with tooltip.
 */
export function tableRow(row: ListViewRow, basePath: string): string {
  const meta = row.metadata;

  const cells = row.fields.map((f, i) => {
    const attr = ` data-field="${escapeHtml(f.name)}"`;

    // First column: name link with description tooltip
    if (i === 0) {
      const rawDesc = meta?.description ?? "";
      const cappedDesc = rawDesc.length > 250 ? rawDesc.slice(0, 250) + "..." : rawDesc;
      const titleAttr = cappedDesc ? ` title="${escapeHtml(cappedDesc)}"` : "";
      return `<td${attr}><a href="${basePath}/${row.id}" class="link"${titleAttr}>${f.value}</a></td>`;
    }

    // is_active column: 3-state dot — archived (yellow) > disabled (red) > active (green)
    if (f.name === "is_active") {
      let dotClass: string;
      let statusLabel: string;
      if (meta?.archivedAt) {
        dotClass = "status-dot--archived";
        statusLabel = "Archived";
      } else if (f.rawValue === true) {
        dotClass = "status-dot--active";
        statusLabel = "Active";
      } else {
        dotClass = "status-dot--inactive";
        statusLabel = "Disabled";
      }

      const titleLines: string[] = [statusLabel];
      if (meta?.archivedAt) titleLines.push(`Archived: ${escapeHtml(meta.archivedAt)}`);
      if (meta?.archivedReason) titleLines.push(`Reason: ${escapeHtml(meta.archivedReason)}`);
      if (meta?.createdAt) titleLines.push(`Created: ${escapeHtml(meta.createdAt)}`);
      if (meta?.updatedAt) titleLines.push(`Updated: ${escapeHtml(meta.updatedAt)}`);
      const combinedTitle = titleLines.join("&#10;");

      return `<td${attr}><span class="status-dot ${dotClass}" title="${combinedTitle}"></span></td>`;
    }

    return `<td${attr}>${f.value}</td>`;
  }).join("");

  return `
    <tr data-id="${row.id}">
      ${cells}
      <td class="actions">
        ${link("View", `${basePath}/${row.id}`, "default", ICON_VIEW, true)}
        ${link("Edit", `${basePath}/${row.id}/edit`, "secondary", ICON_EDIT, true)}
        ${link("Duplicate", `${basePath}/${row.id}/duplicate`, "secondary", ICON_COPY, true)}
        ${deleteForm(`${basePath}/${row.id}/delete`, "Delete", true, true)}
      </td>
    </tr>`;
}
