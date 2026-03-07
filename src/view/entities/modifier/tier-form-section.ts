// src/view/entities/modifier/tier-form-section.ts
// Renders the tier table inside modifier forms.
// Each tier row has inputs for min_value, max_value, level_req, spawn_weight.
// Hidden tiers_json input is populated by browser JS before submit.

import type { TierFormRow, TierFieldMeta } from "@view-service/types";

function tierRowHtml(tier: TierFormRow): string {
  return `
    <tr class="tier-row" data-tier-index="${tier.tier_index}">
      <td class="tier-index">${tier.tier_index}</td>
      <td><input type="number" data-field="tier_min_value" value="${tier.min_value ?? ""}" step="0.0001" class="form-input" /></td>
      <td><input type="number" data-field="tier_max_value" value="${tier.max_value ?? ""}" step="0.0001" class="form-input" /></td>
      <td><input type="number" data-field="tier_level_req" value="${tier.level_req}" min="1" max="99" class="form-input" /></td>
      <td><input type="number" data-field="tier_spawn_weight" value="${tier.spawn_weight}" min="0" max="10000" class="form-input" /></td>
      <td><button type="button" class="btn-remove-tier">Remove</button></td>
    </tr>`;
}

export function tierFormSection(
  tierRows: readonly TierFormRow[],
  tierFieldMeta: readonly TierFieldMeta[],
): string {
  const tierFieldConfigJson = JSON.stringify(tierFieldMeta);

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
            <th></th>
          </tr>
        </thead>
        <tbody id="tier-rows">
          ${tierRows.map((t) => tierRowHtml(t)).join("")}
        </tbody>
      </table>
      <button type="button" id="add-tier-btn" class="btn-add-tier">+ Add Tier</button>
      <input type="hidden" name="tiers_json" id="tiers-json-input" />
      <script id="tier-field-config" type="application/json">${tierFieldConfigJson}</script>
    </div>`;
}
