// src/view/entities/modifier/tier-detail-section.ts
// Renders the tier table on the modifier detail page with inline CRUD controls.
// Add/Edit/Delete tiers individually via AJAX — handled by tier-detail-handler.ts (L6).

import type { TierDetailRow } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";

export function tierDetailSection(tierRows: readonly TierDetailRow[]): string {
  const emptyState = tierRows.length === 0
    ? '<p class="binding-empty">No tiers defined.</p>'
    : "";

  const rows = tierRows
    .map(
      (t) => `
      <tr data-tier-index="${t.tier_index}">
        <td>${t.tier_index}</td>
        <td>${escapeHtml(t.min_value)}</td>
        <td>${escapeHtml(t.max_value)}</td>
        <td>${escapeHtml(t.level_req)}</td>
        <td>${escapeHtml(t.spawn_weight)}</td>
        <td class="actions">
          <button type="button" class="link--icon-only tier-edit-btn" title="Edit">✎</button>
          <button type="button" class="link--icon-only link--danger tier-delete-btn" title="Delete">✖</button>
        </td>
      </tr>`,
    )
    .join("");

  const table = tierRows.length > 0
    ? `
      <table class="data-table data-table--compact" id="tier-detail-table">
        <thead>
          <tr>
            <th>Tier</th>
            <th>Min Value</th>
            <th>Max Value</th>
            <th>Level Req</th>
            <th>Spawn Weight</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`
    : "";

  const inlineForm = `
    <div class="tier-inline-form entity-form" style="display:none; margin-top:0.75rem; max-width:640px;">
      <div class="tier-inline-form__error" style="display:none;">
        <span class="field-error"></span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
        <div class="form-field">
          <label>Min Value</label>
          <input type="number" step="0.0001" data-field="min_value" />
        </div>
        <div class="form-field">
          <label>Max Value</label>
          <input type="number" step="0.0001" data-field="max_value" />
        </div>
        <div class="form-field">
          <label>Level Req</label>
          <input type="number" min="1" max="99" data-field="level_req" />
        </div>
        <div class="form-field">
          <label>Spawn Weight</label>
          <input type="number" min="0" max="10000" data-field="spawn_weight" />
        </div>
      </div>
      <div class="form-actions" style="margin-top:0.75rem;">
        <button type="button" class="btn btn--primary tier-form-save">Save Tier</button>
        <button type="button" class="btn btn--secondary tier-form-cancel">Cancel</button>
      </div>
    </div>`;

  return `
    <div class="tier-section" id="tier-section">
      <h3>Modifier Tiers</h3>
      ${emptyState}
      ${table}
      <button type="button" class="btn btn--secondary btn--small tier-add-btn" style="margin-top:0.75rem;">+ Add Tier</button>
      ${inlineForm}
    </div>`;
}
