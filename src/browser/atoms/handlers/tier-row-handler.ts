// src/browser/atoms/handlers/tier-row-handler.ts
// Manages dynamic tier rows in modifier forms.
// - "Add Tier" appends a new row with auto-assigned tier_index
// - "Remove Tier" deletes a row and re-indexes remaining rows
// - Tier data is serialized to the hidden tiers_json input on every change,
//   so it's always current when the form-submit-handler collects FormData.

export function attachTierHandlers(form: HTMLFormElement): void {
  const tierBody = form.querySelector<HTMLTableSectionElement>("#tier-rows");
  const addBtn = form.querySelector<HTMLButtonElement>("#add-tier-btn");
  const hiddenInput = form.querySelector<HTMLInputElement>("#tiers-json-input");

  if (!tierBody || !addBtn || !hiddenInput) return;

  function syncTierJson(): void {
    hiddenInput!.value = collectTierJson(tierBody!);
  }

  // "Add Tier" button
  addBtn.addEventListener("click", () => {
    const existingRows = tierBody.querySelectorAll<HTMLTableRowElement>(".tier-row");
    const nextIndex = existingRows.length;

    const tr = document.createElement("tr");
    tr.className = "tier-row";
    tr.dataset["tierIndex"] = String(nextIndex);
    tr.innerHTML = `
      <td class="tier-index">${nextIndex}</td>
      <td><input type="number" data-field="tier_min_value" value="" step="0.0001" class="form-input" /></td>
      <td><input type="number" data-field="tier_max_value" value="" step="0.0001" class="form-input" /></td>
      <td><input type="number" data-field="tier_level_req" value="1" min="1" max="99" class="form-input" /></td>
      <td><input type="number" data-field="tier_spawn_weight" value="100" min="0" max="10000" class="form-input" /></td>
      <td><button type="button" class="btn-remove-tier">Remove</button></td>
    `;
    tierBody.appendChild(tr);
    syncTierJson();
  });

  // "Remove Tier" buttons (delegated to tbody)
  tierBody.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains("btn-remove-tier")) return;

    const row = target.closest<HTMLTableRowElement>(".tier-row");
    if (row) {
      row.remove();
      reindexTierRows(tierBody);
      syncTierJson();
    }
  });

  // Re-sync on any input change within the tier table
  tierBody.addEventListener("input", () => {
    syncTierJson();
  });

  // Initial sync — captures pre-populated rows on edit/duplicate forms
  syncTierJson();
}

function reindexTierRows(tierBody: HTMLTableSectionElement): void {
  const rows = tierBody.querySelectorAll<HTMLTableRowElement>(".tier-row");
  rows.forEach((row, index) => {
    row.dataset["tierIndex"] = String(index);
    const indexCell = row.querySelector<HTMLTableCellElement>(".tier-index");
    if (indexCell) indexCell.textContent = String(index);
  });
}

function collectTierJson(tierBody: HTMLTableSectionElement): string {
  const rows = tierBody.querySelectorAll<HTMLTableRowElement>(".tier-row");
  const tiers: Record<string, unknown>[] = [];

  rows.forEach((row, index) => {
    const minVal = row.querySelector<HTMLInputElement>('[data-field="tier_min_value"]');
    const maxVal = row.querySelector<HTMLInputElement>('[data-field="tier_max_value"]');
    const levelReq = row.querySelector<HTMLInputElement>('[data-field="tier_level_req"]');
    const spawnWeight = row.querySelector<HTMLInputElement>('[data-field="tier_spawn_weight"]');

    tiers.push({
      tier_index: index,
      min_value: minVal?.value ?? "",
      max_value: maxVal?.value ?? "",
      level_req: levelReq?.value ?? "1",
      spawn_weight: spawnWeight?.value ?? "100",
    });
  });

  return JSON.stringify(tiers);
}
