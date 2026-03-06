// src/browser/atoms/handlers/cascade-dropdown-handler.ts
// Wires a parent <select> to dynamically filter a child <select> via API fetch.
// When the parent value changes, fetches filtered options and rebuilds the child dropdown.

export interface CascadeDropdownOptions {
  /** CSS selector for the parent dropdown (e.g. '[name="game_domain_id"]') */
  readonly parentSelector: string;
  /** CSS selector for the child dropdown (e.g. '[name="game_subdomain_id"]') */
  readonly childSelector: string;
  /** API URL that accepts the parent value as a query param (e.g. '/api/game-subdomains') */
  readonly apiUrl: string;
  /** Query parameter name to filter by (e.g. 'game_domain_id') */
  readonly filterParam: string;
  /** The field name to use as the option label from the API response */
  readonly labelField: string;
  /** The field name to use as the option value from the API response */
  readonly valueField: string;
  /** Placeholder text for the child dropdown when no parent is selected */
  readonly placeholder?: string;
}

/**
 * Attaches a change listener to the parent dropdown.
 * On change: fetches filtered records from the API, clears the child dropdown,
 * and populates it with new options.
 */
export function attachCascadeDropdownHandler(
  form: HTMLFormElement,
  options: CascadeDropdownOptions,
): void {
  const parent = form.querySelector<HTMLSelectElement>(options.parentSelector);
  const child = form.querySelector<HTMLSelectElement>(options.childSelector);
  if (!parent || !child) return;

  const placeholder = options.placeholder ?? "-- Select --";

  parent.addEventListener("change", async () => {
    const parentValue = parent.value;

    // Reset child to placeholder only
    child.innerHTML = `<option value="">${placeholder}</option>`;
    child.value = "";

    if (!parentValue) return;

    try {
      const url = `${options.apiUrl}?${options.filterParam}=${encodeURIComponent(parentValue)}`;
      const response = await fetch(url);
      if (!response.ok) return;

      const result = (await response.json()) as {
        success: boolean;
        data: Record<string, unknown>[];
      };

      if (!result.success || !Array.isArray(result.data)) return;

      for (const item of result.data) {
        const opt = document.createElement("option");
        opt.value = String(item[options.valueField] ?? "");
        opt.textContent = String(item[options.labelField] ?? "");
        child.appendChild(opt);
      }
    } catch {
      // Network error — leave child with placeholder only
    }
  });
}
