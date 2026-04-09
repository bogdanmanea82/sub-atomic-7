// src/browser/atoms/handlers/tier-detail-handler.ts
// Client-side CRUD for modifier tiers on the detail page.
// Uses the tier API at /api/modifiers/:id/tiers for individual add/edit/delete.

import { postJson, putJson, deleteJson, escapeText } from "../../sub-atoms/utilities";
import { showToast, confirmModal } from "../../molecules/ui";

interface TierData {
  readonly tier_index: number;
  readonly min_value: number;
  readonly max_value: number;
  readonly level_req: number;
  readonly spawn_weight: number;
}

interface TierApiResponse {
  readonly success: boolean;
  readonly data?: readonly TierData[];
  readonly error?: string;
}

/**
 * Extracts the modifier ID from the current URL path.
 */
function getModifierIdFromUrl(): string | null {
  const match = window.location.pathname.match(/\/modifiers\/([^/]+)/);
  return match ? match[1] as string : null;
}

/**
 * Reads form field values from the tier inline form.
 */
function readFormValues(formEl: HTMLElement): Record<string, unknown> {
  const getValue = (field: string): string =>
    (formEl.querySelector<HTMLInputElement>(`[data-field="${field}"]`))?.value ?? "";

  return {
    min_value: Number(getValue("min_value")),
    max_value: Number(getValue("max_value")),
    level_req: Number(getValue("level_req")),
    spawn_weight: Number(getValue("spawn_weight")),
  };
}

/**
 * Populates the inline form with existing tier values for editing.
 */
function populateForm(formEl: HTMLElement, tier: TierData): void {
  const setField = (name: string, value: string): void => {
    const el = formEl.querySelector<HTMLInputElement>(`[data-field="${name}"]`);
    if (el) el.value = value;
  };

  setField("min_value", String(tier.min_value));
  setField("max_value", String(tier.max_value));
  setField("level_req", String(tier.level_req));
  setField("spawn_weight", String(tier.spawn_weight));
}

/**
 * Resets all fields in the tier form.
 */
function resetForm(formEl: HTMLElement): void {
  const inputs = formEl.querySelectorAll<HTMLInputElement>("input[type='number']");
  for (const input of inputs) input.value = "";
  hideFormError(formEl);
  delete formEl.dataset["editingIndex"];
}

function showFormError(formEl: HTMLElement, message: string): void {
  const errorDiv = formEl.querySelector<HTMLElement>(".tier-inline-form__error");
  if (!errorDiv) return;
  const span = errorDiv.querySelector<HTMLElement>(".field-error");
  if (span) span.textContent = message;
  errorDiv.style.display = "";
}

function hideFormError(formEl: HTMLElement): void {
  const errorDiv = formEl.querySelector<HTMLElement>(".tier-inline-form__error");
  if (errorDiv) errorDiv.style.display = "none";
}

/**
 * Formats a number for display (matches L4 formatNumber output).
 */
function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toLocaleString("en-GB", { maximumFractionDigits: 4 });
}

/**
 * Builds a table row HTML string for a tier.
 */
function buildRowHtml(tier: TierData): string {
  return `
    <tr data-tier-index="${tier.tier_index}">
      <td>${tier.tier_index}</td>
      <td>${escapeText(formatNum(tier.min_value))}</td>
      <td>${escapeText(formatNum(tier.max_value))}</td>
      <td>${escapeText(formatNum(tier.level_req))}</td>
      <td>${escapeText(formatNum(tier.spawn_weight))}</td>
      <td class="actions">
        <button type="button" class="link--icon-only tier-edit-btn" title="Edit">✎</button>
        <button type="button" class="link--icon-only link--danger tier-delete-btn" title="Delete">✖</button>
      </td>
    </tr>`;
}

/**
 * Rebuilds the entire tier table from an API response.
 */
function rebuildTable(section: HTMLElement, tiers: readonly TierData[]): void {
  // Remove existing table or empty state
  const existingTable = section.querySelector("#tier-detail-table");
  if (existingTable) existingTable.remove();
  const emptyMsg = section.querySelector(".binding-empty");
  if (emptyMsg) emptyMsg.remove();

  if (tiers.length === 0) {
    const h3 = section.querySelector("h3");
    const emptyP = document.createElement("p");
    emptyP.className = "binding-empty";
    emptyP.textContent = "No tiers defined.";
    if (h3) h3.insertAdjacentElement("afterend", emptyP);
    return;
  }

  const rows = tiers.map((t) => buildRowHtml(t)).join("");
  const table = document.createElement("table");
  table.className = "data-table data-table--compact";
  table.id = "tier-detail-table";
  table.innerHTML = `
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
    <tbody>${rows}</tbody>`;

  // Insert after h3, before the add button
  const addBtn = section.querySelector(".tier-add-btn");
  if (addBtn) {
    section.insertBefore(table, addBtn);
  } else {
    section.appendChild(table);
  }
}

/**
 * Main entry point — attaches all tier CRUD handlers on the detail page.
 * Safe to call on any page — no-ops if no #tier-section is found.
 */
export function attachTierDetailHandler(): void {
  const section = document.querySelector<HTMLElement>("#tier-section");
  if (!section) return;

  const modifierId = getModifierIdFromUrl();
  if (!modifierId) return;

  const formEl = section.querySelector<HTMLElement>(".tier-inline-form");
  if (!formEl) return;

  const addBtn = section.querySelector<HTMLButtonElement>(".tier-add-btn");

  function showForm(): void {
    if (formEl) formEl.style.display = "";
    if (addBtn) addBtn.style.display = "none";
  }

  function hideForm(): void {
    if (formEl) {
      formEl.style.display = "none";
      resetForm(formEl);
    }
    if (addBtn) addBtn.style.display = "";
  }

  // ── "Add Tier" button ─────────────────────────────────────────────────
  section.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".tier-add-btn");
    if (!btn) return;
    resetForm(formEl);
    showForm();
  });

  // ── "Edit" button ─────────────────────────────────────────────────────
  section.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".tier-edit-btn");
    if (!btn) return;

    const row = btn.closest<HTMLTableRowElement>("tr[data-tier-index]");
    if (!row) return;

    const tierIndex = row.dataset["tierIndex"];
    const cells = row.querySelectorAll("td");
    // cells: [tier_index, min_value, max_value, level_req, spawn_weight, actions]
    const tier: TierData = {
      tier_index: Number(tierIndex),
      min_value: Number(cells[1]?.textContent ?? 0),
      max_value: Number(cells[2]?.textContent ?? 0),
      level_req: Number(cells[3]?.textContent ?? 0),
      spawn_weight: Number(cells[4]?.textContent ?? 0),
    };

    formEl.dataset["editingIndex"] = tierIndex;
    populateForm(formEl, tier);
    showForm();
  });

  // ── "Delete" button ───────────────────────────────────────────────────
  section.addEventListener("click", async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".tier-delete-btn");
    if (!btn) return;

    const row = btn.closest<HTMLTableRowElement>("tr[data-tier-index]");
    if (!row) return;

    const tierIndex = row.dataset["tierIndex"];
    const confirmed = await confirmModal("Delete Tier", `Delete tier ${tierIndex}? Remaining tiers will be reindexed.`);
    if (!confirmed) return;

    try {
      const result = await deleteJson<TierApiResponse>(`/api/modifiers/${modifierId}/tiers/${tierIndex}`);
      rebuildTable(section, result.data ?? []);
      showToast("Tier deleted", "success");
    } catch (err) {
      const error = err as { message?: string };
      showToast(error.message ?? "Failed to delete tier", "error");
    }
  });

  // ── "Save" button ─────────────────────────────────────────────────────
  section.addEventListener("click", async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".tier-form-save");
    if (!btn) return;

    const data = readFormValues(formEl);
    const editingIndex = formEl.dataset["editingIndex"];
    const isEdit = editingIndex !== undefined;

    hideFormError(formEl);
    btn.disabled = true;
    btn.textContent = "Saving...";

    try {
      let result: TierApiResponse;
      if (isEdit) {
        result = await putJson<TierApiResponse>(
          `/api/modifiers/${modifierId}/tiers/${editingIndex}`, data,
        );
      } else {
        result = await postJson<TierApiResponse>(
          `/api/modifiers/${modifierId}/tiers`, data,
        );
      }

      rebuildTable(section, result.data ?? []);
      hideForm();
      showToast(isEdit ? "Tier updated" : "Tier added", "success");
    } catch (err) {
      const error = err as { message?: string };
      showFormError(formEl, error.message ?? "Failed to save tier");
    } finally {
      btn.disabled = false;
      btn.textContent = "Save Tier";
    }
  });

  // ── "Cancel" button ───────────────────────────────────────────────────
  section.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".tier-form-cancel");
    if (!btn) return;
    hideForm();
  });
}
