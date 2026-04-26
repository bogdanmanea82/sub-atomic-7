// src/browser/atoms/handlers/binding-handler.ts
// Client-side CRUD for modifier bindings.
// Attaches to the binding panel rendered by binding-detail-panel.ts (L5).
// Uses fetchJson to call the nested API at /api/modifiers/:id/bindings.

import { fetchJson, postJson, putJson, deleteJson, escapeText } from "../../sub-atoms/utilities";
import { showToast } from "../../molecules/ui";
import { confirmModal } from "../../molecules/ui";

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly error?: string;
  readonly details?: Record<string, string>;
}

interface BindingRecord {
  readonly id: string;
  readonly target_type: string;
  readonly target_id: string;
  readonly is_included: boolean;
  readonly weight_override: number | null;
  readonly min_tier_index: number | null;
  readonly max_tier_index: number | null;
  readonly level_req_override: number | null;
}

interface TargetOption {
  readonly id: string;
  readonly name: string;
}

/**
 * Extracts the modifier ID from the current URL path.
 * Works for both /modifiers/:id and /modifiers/:id/edit.
 */
function getModifierIdFromUrl(): string | null {
  const match = window.location.pathname.match(/\/modifiers\/([^/]+)/);
  return match ? match[1] as string : null;
}

/**
 * Builds the API base URL for a modifier's bindings.
 */
function bindingApiUrl(modifierId: string, bindingId?: string): string {
  const base = `/api/modifiers/${modifierId}/bindings`;
  return bindingId ? `${base}/${bindingId}` : base;
}

/**
 * Fetches target options (categories or subcategories) for the dropdown.
 */
async function fetchTargetOptions(targetType: string): Promise<TargetOption[]> {
  const apiUrl = targetType === "category"
    ? "/api/game-categories"
    : "/api/game-subcategories";
  const result = await fetchJson<ApiResponse<TargetOption[]>>(apiUrl);
  return result.data;
}

/**
 * Reads form field values from a binding form container.
 */
function readFormValues(formEl: HTMLElement): Record<string, unknown> {
  const getValue = (field: string): string =>
    (formEl.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-field="${field}"]`))?.value ?? "";

  const data: Record<string, unknown> = {
    target_type: formEl.dataset["targetType"],
    target_id: getValue("target_id"),
    is_included: getValue("is_included") === "true",
  };

  // Nullable fields — send null when empty
  const weightStr = getValue("weight_override");
  data["weight_override"] = weightStr !== "" ? Number(weightStr) : null;

  const minTierStr = getValue("min_tier_index");
  data["min_tier_index"] = minTierStr !== "" ? Number(minTierStr) : null;

  const maxTierStr = getValue("max_tier_index");
  data["max_tier_index"] = maxTierStr !== "" ? Number(maxTierStr) : null;

  const levelReqStr = getValue("level_req_override");
  data["level_req_override"] = levelReqStr !== "" ? Number(levelReqStr) : null;

  return data;
}

/**
 * Populates a binding form with existing values (for editing).
 */
function populateForm(formEl: HTMLElement, binding: BindingRecord): void {
  const setField = (name: string, value: string): void => {
    const el = formEl.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-field="${name}"]`);
    if (el) el.value = value;
  };

  setField("target_id", binding.target_id);
  setField("is_included", String(binding.is_included));
  setField("weight_override", binding.weight_override != null ? String(binding.weight_override) : "");
  setField("min_tier_index", binding.min_tier_index != null ? String(binding.min_tier_index) : "");
  setField("max_tier_index", binding.max_tier_index != null ? String(binding.max_tier_index) : "");
  setField("level_req_override", binding.level_req_override != null ? String(binding.level_req_override) : "");
}

/**
 * Resets all fields in a binding form to their defaults.
 */
function resetForm(formEl: HTMLElement): void {
  const inputs = formEl.querySelectorAll<HTMLInputElement>("input[type='number']");
  for (const input of inputs) input.value = "";

  const targetSelect = formEl.querySelector<HTMLSelectElement>(`[data-field="target_id"]`);
  if (targetSelect) targetSelect.value = "";

  const includedSelect = formEl.querySelector<HTMLSelectElement>(`[data-field="is_included"]`);
  if (includedSelect) includedSelect.value = "true";

  hideFormError(formEl);

  // Clear edit state
  delete formEl.dataset["editingId"];
}

/**
 * Shows an error message in the binding form.
 */
function showFormError(formEl: HTMLElement, message: string): void {
  const errorDiv = formEl.querySelector<HTMLElement>(".binding-form__error");
  if (!errorDiv) return;
  const span = errorDiv.querySelector<HTMLElement>(".field-error");
  if (span) span.textContent = message;
  errorDiv.style.display = "";
}

/**
 * Hides the error message in the binding form.
 */
function hideFormError(formEl: HTMLElement): void {
  const errorDiv = formEl.querySelector<HTMLElement>(".binding-form__error");
  if (errorDiv) errorDiv.style.display = "none";
}

/**
 * Builds a table row HTML string for a newly created/updated binding.
 */
function buildRowHtml(binding: BindingRecord, targetName: string): string {
  const badge = binding.is_included
    ? '<span class="badge badge--active">Included</span>'
    : '<span class="badge badge--inactive">Excluded</span>';

  const weight = binding.weight_override != null ? String(binding.weight_override) : "Global default";
  const minTier = binding.min_tier_index != null ? String(binding.min_tier_index) : "All tiers";
  const maxTier = binding.max_tier_index != null ? String(binding.max_tier_index) : "All tiers";
  const levelReq = binding.level_req_override != null ? String(binding.level_req_override) : "Per tier default";

  return `
    <tr class="binding-row" data-binding-id="${escapeText(binding.id)}">
      <td>${escapeText(targetName)}</td>
      <td>${badge}</td>
      <td>${escapeText(weight)}</td>
      <td>${escapeText(minTier)}</td>
      <td>${escapeText(maxTier)}</td>
      <td>${escapeText(levelReq)}</td>
      <td class="actions">
        <button type="button" class="link--icon-only binding-edit-btn" title="Edit">✎</button>
        <button type="button" class="link--icon-only link--danger binding-remove-btn" title="Delete">✖</button>
      </td>
    </tr>`;
}

/**
 * Ensures the section has a <table> (creates one if only the empty-state <p> exists).
 */
function ensureTable(section: HTMLElement, targetType: string): HTMLTableSectionElement {
  let tbody = section.querySelector<HTMLTableSectionElement>(`tbody[data-target-type="${targetType}"]`);
  if (tbody) return tbody;

  // Remove the "No bindings defined." message
  const emptyMsg = section.querySelector(".binding-empty");
  if (emptyMsg) emptyMsg.remove();

  // Create the table
  const table = document.createElement("table");
  table.className = "data-table data-table--compact binding-table";
  table.innerHTML = `
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
    <tbody data-target-type="${targetType}"></tbody>`;

  // Insert before the "Add" button
  const addBtn = section.querySelector(".binding-add-btn");
  if (addBtn) {
    section.insertBefore(table, addBtn);
  } else {
    section.appendChild(table);
  }

  return table.querySelector("tbody") as HTMLTableSectionElement;
}

/**
 * If the table body is empty after a removal, replace it with the empty-state message.
 */
function checkEmptyState(section: HTMLElement): void {
  const tbody = section.querySelector("tbody");
  if (!tbody || tbody.children.length > 0) return;

  // Remove the table, add the empty message
  const table = tbody.closest("table");
  if (table) table.remove();

  const h3 = section.querySelector("h3");
  const emptyP = document.createElement("p");
  emptyP.className = "binding-empty";
  emptyP.textContent = "No bindings defined.";
  if (h3) {
    h3.insertAdjacentElement("afterend", emptyP);
  } else {
    section.prepend(emptyP);
  }
}

// ── Private handler functions ──────────────────────────────────────────────

function attachAddHandler(
  panel: HTMLElement,
  targetOptionsCache: Map<string, TargetOption[]>,
): void {
  panel.addEventListener("click", async (e) => {
    const addBtn = (e.target as HTMLElement).closest<HTMLButtonElement>(".binding-add-btn");
    if (!addBtn) return;

    const targetType = addBtn.dataset["targetType"];
    if (!targetType) return;

    const formEl = panel.querySelector<HTMLElement>(`.binding-form[data-target-type="${targetType}"]`);
    if (!formEl) return;

    // Load target options if not cached
    if (!targetOptionsCache.has(targetType)) {
      try {
        const options = await fetchTargetOptions(targetType);
        targetOptionsCache.set(targetType, options);
      } catch {
        showToast("Failed to load target options", "error");
        return;
      }
    }

    // Populate dropdown
    const select = formEl.querySelector<HTMLSelectElement>(`[data-field="target_id"]`);
    if (select && select.options.length <= 1) {
      const options = targetOptionsCache.get(targetType) ?? [];
      for (const opt of options) {
        const optEl = document.createElement("option");
        optEl.value = opt.id;
        optEl.textContent = opt.name;
        select.appendChild(optEl);
      }
    }

    // Reset and show form
    resetForm(formEl);
    formEl.style.display = "";
    addBtn.style.display = "none";
  });
}

function attachCancelHandler(panel: HTMLElement): void {
  panel.addEventListener("click", (e) => {
    const cancelBtn = (e.target as HTMLElement).closest<HTMLButtonElement>(".binding-form__cancel");
    if (!cancelBtn) return;

    const formEl = cancelBtn.closest<HTMLElement>(".binding-form");
    if (!formEl) return;

    const targetType = formEl.dataset["targetType"];
    formEl.style.display = "none";
    resetForm(formEl);

    // Re-show the "Add" button
    const addBtn = panel.querySelector<HTMLButtonElement>(`.binding-add-btn[data-target-type="${targetType}"]`);
    if (addBtn) addBtn.style.display = "";
  });
}

function attachSaveHandler(
  panel: HTMLElement,
  modifierId: string,
  targetOptionsCache: Map<string, TargetOption[]>,
): void {
  panel.addEventListener("click", async (e) => {
    const saveBtn = (e.target as HTMLElement).closest<HTMLButtonElement>(".binding-form__save");
    if (!saveBtn) return;

    const formEl = saveBtn.closest<HTMLElement>(".binding-form");
    if (!formEl) return;

    const data = readFormValues(formEl);
    const editingId = formEl.dataset["editingId"];
    const targetType = formEl.dataset["targetType"] ?? "";
    const section = formEl.closest<HTMLElement>(".binding-section");

    // Basic client-side validation
    if (!data["target_id"]) {
      showFormError(formEl, "Please select a target.");
      return;
    }

    hideFormError(formEl);
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      let binding: BindingRecord;

      if (editingId) {
        // Update existing binding
        const result = await putJson<ApiResponse<BindingRecord>>(
          bindingApiUrl(modifierId, editingId), data,
        );
        binding = result.data;
      } else {
        // Create new binding
        const result = await postJson<ApiResponse<BindingRecord>>(
          bindingApiUrl(modifierId), data,
        );
        binding = result.data;
      }

      // Resolve target name from cached options
      const options = targetOptionsCache.get(targetType) ?? [];
      const targetName = options.find((o) => o.id === binding.target_id)?.name ?? binding.target_id;

      if (section) {
        if (editingId) {
          // Replace existing row
          const existingRow = section.querySelector<HTMLElement>(`tr[data-binding-id="${editingId}"]`);
          if (existingRow) {
            existingRow.outerHTML = buildRowHtml(binding, targetName);
          }
        } else {
          // Add new row to table
          const tbody = ensureTable(section, targetType);
          tbody.insertAdjacentHTML("beforeend", buildRowHtml(binding, targetName));
        }
      }

      // Hide form, re-show add button
      formEl.style.display = "none";
      resetForm(formEl);
      const addBtn = panel.querySelector<HTMLButtonElement>(`.binding-add-btn[data-target-type="${targetType}"]`);
      if (addBtn) addBtn.style.display = "";

      showToast(editingId ? "Binding updated" : "Binding added", "success");
    } catch (err) {
      const error = err as { message?: string; status?: number };
      // Try to extract validation details from the error response
      let message = error.message ?? "Failed to save binding";
      try {
        // The error might contain a JSON body with details
        if (message === "Validation failed") {
          message = "A binding for this target already exists, or the input is invalid.";
        }
      } catch {
        // ignore
      }
      showFormError(formEl, message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Binding";
    }
  });
}

function attachEditHandler(
  panel: HTMLElement,
  modifierId: string,
  targetOptionsCache: Map<string, TargetOption[]>,
): void {
  panel.addEventListener("click", async (e) => {
    const editBtn = (e.target as HTMLElement).closest<HTMLButtonElement>(".binding-edit-btn");
    if (!editBtn) return;

    const row = editBtn.closest<HTMLTableRowElement>(".binding-row");
    if (!row) return;

    const bindingId = row.dataset["bindingId"];
    if (!bindingId) return;

    const tbody = row.closest<HTMLTableSectionElement>("tbody");
    const targetType = tbody?.dataset["targetType"] ?? "";
    const section = row.closest<HTMLElement>(".binding-section");
    if (!section) return;

    const formEl = section.querySelector<HTMLElement>(`.binding-form[data-target-type="${targetType}"]`);
    if (!formEl) return;

    // Load target options if not cached
    if (!targetOptionsCache.has(targetType)) {
      try {
        const options = await fetchTargetOptions(targetType);
        targetOptionsCache.set(targetType, options);
      } catch {
        showToast("Failed to load target options", "error");
        return;
      }
    }

    // Populate dropdown if not done yet
    const select = formEl.querySelector<HTMLSelectElement>(`[data-field="target_id"]`);
    if (select && select.options.length <= 1) {
      const options = targetOptionsCache.get(targetType) ?? [];
      for (const opt of options) {
        const optEl = document.createElement("option");
        optEl.value = opt.id;
        optEl.textContent = opt.name;
        select.appendChild(optEl);
      }
    }

    // Fetch current binding data
    try {
      const result = await fetchJson<ApiResponse<{ category: BindingRecord[]; subcategory: BindingRecord[] }>>(
        bindingApiUrl(modifierId),
      );
      const allBindings = [...result.data.category, ...result.data.subcategory];
      const binding = allBindings.find((b) => b.id === bindingId);
      if (!binding) {
        showToast("Binding not found", "error");
        return;
      }

      // Set edit mode
      formEl.dataset["editingId"] = bindingId;
      populateForm(formEl, binding);
      formEl.style.display = "";

      // Hide the add button
      const addBtn = panel.querySelector<HTMLButtonElement>(`.binding-add-btn[data-target-type="${targetType}"]`);
      if (addBtn) addBtn.style.display = "none";
    } catch {
      showToast("Failed to load binding data", "error");
    }
  });
}

function attachRemoveHandler(panel: HTMLElement, modifierId: string): void {
  panel.addEventListener("click", async (e) => {
    const removeBtn = (e.target as HTMLElement).closest<HTMLButtonElement>(".binding-remove-btn");
    if (!removeBtn) return;

    const row = removeBtn.closest<HTMLTableRowElement>(".binding-row");
    if (!row) return;

    const bindingId = row.dataset["bindingId"];
    if (!bindingId) return;

    const confirmed = await confirmModal(
      "Remove Binding",
      "Are you sure you want to remove this binding?",
    );
    if (!confirmed) return;

    try {
      await deleteJson(bindingApiUrl(modifierId, bindingId));
      const section = row.closest<HTMLElement>(".binding-section");
      row.remove();
      if (section) checkEmptyState(section);
      showToast("Binding removed", "success");
    } catch {
      showToast("Failed to remove binding", "error");
    }
  });
}

// ── Public entry point ─────────────────────────────────────────────────────

/**
 * Main entry point — attaches all binding CRUD handlers to the panel.
 * Safe to call on any page — no-ops if no .binding-panel is found.
 */
export function attachBindingHandler(): void {
  const panel = document.querySelector<HTMLElement>(".binding-panel");
  if (!panel) return;

  const modifierId = getModifierIdFromUrl();
  if (!modifierId) return;

  // Cache for target options (loaded once per section when form opens)
  const targetOptionsCache = new Map<string, TargetOption[]>();

  attachAddHandler(panel, targetOptionsCache);
  attachCancelHandler(panel);
  attachSaveHandler(panel, modifierId, targetOptionsCache);
  attachEditHandler(panel, modifierId, targetOptionsCache);
  attachRemoveHandler(panel, modifierId);
}
