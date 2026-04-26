// src/browser/atoms/handlers/name-availability-handler.ts
// Checks name uniqueness via AJAX on duplicate and edit pages.
// Disables the submit button when the name conflicts with an existing record.

import { debounce } from "../../sub-atoms/utilities";
import { fetchJson } from "../../sub-atoms/utilities/fetch-json";
import { displayFieldError } from "../../molecules/ui";

interface AvailabilityResponse {
  readonly available: boolean;
}

interface NameAvailabilityOptions {
  /** The API endpoint URL for checking name availability. */
  readonly checkUrl: string;
  /** The name the record currently has (duplicate source or edit current). */
  readonly originalName: string;
  /** Optional record ID to exclude from the check (used on edit pages). */
  readonly excludeId?: string;
  /** When true, the button starts disabled and shows a hint (duplicate mode). */
  readonly startDisabled: boolean;
  /** The form input field name to watch. Defaults to "name". */
  readonly fieldName?: string;
  /** The query param key sent to the check URL. Defaults to "name". */
  readonly queryParam?: string;
}

/**
 * Attaches a debounced availability check to a name input field.
 * Two modes:
 * - Duplicate: button starts disabled, user must change the name
 * - Edit: button starts enabled, but disables if user picks a taken name
 */
export function attachNameAvailabilityHandler(
  form: HTMLFormElement,
  options: NameAvailabilityOptions
): void {
  const field = options.fieldName ?? "name";
  const param = options.queryParam ?? "name";
  const nameInput = form.querySelector<HTMLInputElement>(`[name="${field}"]`);
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!nameInput || !submitBtn) return;

  if (options.startDisabled) {
    submitBtn.disabled = true;
    displayFieldError(nameInput, "Change the name before saving — this name is already taken.");
  }

  const checkAvailability = debounce(async () => {
    const name = nameInput.value.trim();

    // Empty name — let the form validator handle it
    if (name === "") {
      displayFieldError(nameInput, null);
      submitBtn.disabled = false;
      return;
    }

    // Duplicate mode: unchanged name is always invalid
    if (options.startDisabled && name === options.originalName) {
      displayFieldError(nameInput, "Change the name before saving — this name is already taken.");
      submitBtn.disabled = true;
      return;
    }

    // Edit mode: keeping your own name is fine — no API call needed
    if (!options.startDisabled && name === options.originalName) {
      displayFieldError(nameInput, null);
      submitBtn.disabled = false;
      return;
    }

    // Call the API with optional excludeId
    try {
      let url = `${options.checkUrl}?${param}=${encodeURIComponent(name)}`;
      if (options.excludeId) {
        url += `&excludeId=${encodeURIComponent(options.excludeId)}`;
      }
      const result = await fetchJson<AvailabilityResponse>(url);

      if (result.available) {
        displayFieldError(nameInput, null);
        submitBtn.disabled = false;
      } else {
        displayFieldError(nameInput, "This name is already taken. Please choose another.");
        submitBtn.disabled = true;
      }
    } catch {
      // Network error — don't block the user, let server-side validation catch it
      displayFieldError(nameInput, null);
      submitBtn.disabled = false;
    }
  }, 400);

  nameInput.addEventListener("input", checkAvailability);
  nameInput.addEventListener("blur", () => {
    checkAvailability();
  });
}
