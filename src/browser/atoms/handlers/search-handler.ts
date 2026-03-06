// src/browser/atoms/handlers/search-handler.ts
// Filters table rows based on search input.
// Pure client-side filtering — no API call, instant feedback.

import { debounce } from "../../sub-atoms/utilities";

/**
 * Attaches a debounced input listener to a search field that filters table rows.
 * Rows that don't match the query get hidden via a CSS class.
 * `rowSelector` identifies the table rows (e.g. ".data-table tbody tr").
 */
export function attachSearchHandler(
  searchInput: HTMLInputElement,
  rowSelector: string,
  debounceMs: number = 200
): void {
  const filterRows = (): void => {
    const query = searchInput.value.toLowerCase().trim();
    const rows = document.querySelectorAll<HTMLElement>(rowSelector);

    for (const row of rows) {
      const text = (row.textContent ?? "").toLowerCase();
      const matches = query === "" || text.includes(query);
      row.style.display = matches ? "" : "none";
    }
  };

  searchInput.addEventListener("input", debounce(filterRows, debounceMs));
}
