// src/view/entities/modifier/binding-detail-panel.ts
// Renders the binding panel for the Bindings tab.
// Two sections (category + subcategory), each with a table and an "Add Binding" form.
// The browser handler (L6) wires up add/edit/remove interactions.

import type { BindingDetailRow } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";

function inclusionBadge(included: boolean): string {
  return included
    ? '<span class="badge badge--active">Included</span>'
    : '<span class="badge badge--inactive">Excluded</span>';
}

function bindingTable(rows: readonly BindingDetailRow[], targetType: string): string {
  const tableRows = rows
    .map(
      (b) => `
      <tr class="binding-row" data-binding-id="${escapeHtml(b.id)}">
        <td>${escapeHtml(b.targetName)}</td>
        <td>${inclusionBadge(b.isIncluded)}</td>
        <td>${escapeHtml(b.weightOverride)}</td>
        <td>${escapeHtml(b.minTier)}</td>
        <td>${escapeHtml(b.maxTier)}</td>
        <td>${escapeHtml(b.levelReqOverride)}</td>
        <td class="actions">
          <button type="button" class="link--icon-only binding-edit-btn" title="Edit">✎</button>
          <button type="button" class="link--icon-only link--danger binding-remove-btn" title="Delete">✖</button>
        </td>
      </tr>`,
    )
    .join("");

  if (rows.length === 0) {
    return `<p class="binding-empty">No bindings defined.</p>`;
  }

  return `
    <table class="data-table data-table--compact binding-table">
      <thead>
        <tr>
          <th>Target</th>
          <th>Status</th>
          <th>Weight</th>
          <th>Min Tier</th>
          <th>Max Tier</th>
          <th>Level Req</th>
          <th></th>
        </tr>
      </thead>
      <tbody data-target-type="${targetType}">${tableRows}</tbody>
    </table>`;
}

function addBindingForm(targetType: string): string {
  const targetLabel = targetType === "category" ? "Category" : "Subcategory";
  return `
    <div class="binding-form" data-target-type="${targetType}" style="display:none">
      <div class="entity-form" style="margin-top:1rem">
        <div class="form-field">
          <label>Target ${targetLabel}</label>
          <select data-field="target_id" class="binding-form__target">
            <option value="">-- Select ${targetLabel} --</option>
          </select>
        </div>
        <div class="form-field">
          <label>Included</label>
          <select data-field="is_included">
            <option value="true" selected>Yes — eligible</option>
            <option value="false">No — explicitly excluded</option>
          </select>
        </div>
        <div class="form-field">
          <label>Weight Override <span style="color:#999; font-weight:normal">(empty = global default)</span></label>
          <input type="number" data-field="weight_override" min="0" max="10000" placeholder="Leave empty for global default" />
        </div>
        <div class="form-field" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem">
          <div>
            <label>Min Tier <span style="color:#999; font-weight:normal">(empty = all)</span></label>
            <input type="number" data-field="min_tier_index" min="0" max="999" placeholder="All tiers" />
          </div>
          <div>
            <label>Max Tier <span style="color:#999; font-weight:normal">(empty = all)</span></label>
            <input type="number" data-field="max_tier_index" min="0" max="999" placeholder="All tiers" />
          </div>
        </div>
        <div class="form-field">
          <label>Level Req Override <span style="color:#999; font-weight:normal">(empty = per tier default)</span></label>
          <input type="number" data-field="level_req_override" min="1" max="99" placeholder="Leave empty for per-tier default" />
        </div>
        <div class="form-field binding-form__error" style="display:none">
          <span class="field-error"></span>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn--primary binding-form__save">Save Binding</button>
          <button type="button" class="btn btn--secondary binding-form__cancel">Cancel</button>
        </div>
      </div>
    </div>`;
}

export function bindingDetailPanel(
  categoryBindings: readonly BindingDetailRow[],
  subcategoryBindings: readonly BindingDetailRow[],
): string {
  return `
    <div class="binding-panel">
      <div class="binding-section" data-section="category">
        <h3>Category Bindings</h3>
        ${bindingTable(categoryBindings, "category")}
        <button type="button" class="btn btn--secondary binding-add-btn" data-target-type="category" style="margin-top:0.75rem">+ Add Category Binding</button>
        ${addBindingForm("category")}
      </div>
      <div class="binding-section" data-section="subcategory">
        <h3>Subcategory Bindings</h3>
        ${bindingTable(subcategoryBindings, "subcategory")}
        <button type="button" class="btn btn--secondary binding-add-btn" data-target-type="subcategory" style="margin-top:0.75rem">+ Add Subcategory Binding</button>
        ${addBindingForm("subcategory")}
      </div>
    </div>`;
}
