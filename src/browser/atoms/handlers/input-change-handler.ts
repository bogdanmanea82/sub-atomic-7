// src/browser/atoms/handlers/input-change-handler.ts
// Attaches real-time validation to a form input on blur.
// Uses debounce so rapid typing doesn't trigger validation on every keystroke.

import { debounce } from "../../sub-atoms/utilities";

/** Callback that validates one field and returns an error message or null. */
export type FieldValidator = (value: string, fieldLabel: string) => string | null;

/** Callback to display or clear a field-level error message. */
export type FieldErrorDisplay = (input: HTMLElement, error: string | null) => void;

/**
 * Attaches blur and debounced input listeners to a single form field.
 * `validator` runs the field's validation rules and returns an error or null.
 * `displayError` shows or clears the error message next to the field.
 */
export function attachInputChangeHandler(
  input: HTMLInputElement | HTMLTextAreaElement,
  fieldLabel: string,
  validator: FieldValidator,
  displayError: FieldErrorDisplay,
  debounceMs: number = 300
): void {
  const validate = (): void => {
    const error = validator(input.value, fieldLabel);
    displayError(input, error);
  };

  // Validate immediately when the user leaves the field
  input.addEventListener("blur", validate);

  // Also validate while typing, but debounced
  const debouncedValidate = debounce(validate, debounceMs);
  input.addEventListener("input", debouncedValidate);
}
