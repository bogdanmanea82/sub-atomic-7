// src/view/entities/modifier/tier-detail-section.ts
// Renders a read-only tier table for the modifier detail page.

import type { TierDetailRow } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";

export function tierDetailSection(tierRows: readonly TierDetailRow[]): string {
  if (tierRows.length === 0) {
    return `<div class="tier-section"><h3>Modifier Tiers</h3><p>No tiers defined.</p></div>`;
  }

  const rows = tierRows
    .map(
      (t) => `
      <tr>
        <td>${t.tier_index}</td>
        <td>${escapeHtml(t.min_value)}</td>
        <td>${escapeHtml(t.max_value)}</td>
        <td>${escapeHtml(t.level_req)}</td>
        <td>${escapeHtml(t.spawn_weight)}</td>
      </tr>`
    )
    .join("");

  return `
    <div class="tier-section">
      <h3>Modifier Tiers</h3>
      <table class="tier-table">
        <thead>
          <tr>
            <th>Tier</th>
            <th>Min Value</th>
            <th>Max Value</th>
            <th>Level Req</th>
            <th>Spawn Weight</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}
