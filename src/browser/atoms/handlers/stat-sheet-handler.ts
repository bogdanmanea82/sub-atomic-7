// src/browser/atoms/handlers/stat-sheet-handler.ts
// Keeps the stat_sheet_json hidden input in sync with the editable stat value inputs.
// Rows are fixed (one per stat) — the handler only syncs values, never adds/removes rows.

export function attachStatSheetHandler(form: HTMLFormElement): void {
  const statSheetSection = form.querySelector<HTMLElement>("#stat-sheet-section");
  const hiddenInput = form.querySelector<HTMLInputElement>("#stat-sheet-json");

  if (!statSheetSection || !hiddenInput) return;

  function syncJson(): void {
    hiddenInput!.value = collectStatSheetJson(statSheetSection!);
  }

  // Re-sync on any input change within the stat sheet section
  statSheetSection.addEventListener("input", () => {
    syncJson();
  });

  // Initial sync — captures pre-populated values rendered by L5
  syncJson();
}

function collectStatSheetJson(container: HTMLElement): string {
  const inputs = container.querySelectorAll<HTMLInputElement>(".stat-value-input[data-stat-id]");
  const rows: { stat_id: string; base_value: number }[] = [];

  inputs.forEach((input) => {
    const statId = input.dataset["statId"];
    if (!statId) return;
    const raw = input.value.trim();
    const base_value = raw === "" ? 0 : parseInt(raw, 10);
    rows.push({ stat_id: statId, base_value: isNaN(base_value) ? 0 : base_value });
  });

  return JSON.stringify(rows);
}
