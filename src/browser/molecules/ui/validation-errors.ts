// src/browser/molecules/ui/validation-errors.ts
// Displays and clears validation error messages next to form fields
// and as a summary above the form.

const ERROR_STYLES = `
  .field-error {
    color: #dc3545; font-size: 0.8rem; margin-top: 0.25rem;
  }
  .form-field--invalid input,
  .form-field--invalid textarea {
    border-color: #dc3545;
  }
  .form-errors {
    background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;
    border-radius: 6px; padding: 1rem; margin-bottom: 1.25rem;
  }
  .form-errors ul {
    margin: 0; padding-left: 1.25rem;
  }
  .form-errors li {
    margin-bottom: 0.25rem;
  }
`;

let stylesInjected = false;

function injectStyles(): void {
  if (stylesInjected) return;
  const style = document.createElement("style");
  style.textContent = ERROR_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

/**
 * Shows or clears an error message next to a single form field.
 * Adds the invalid class to the parent .form-field for border highlighting.
 * Pass null to clear the error.
 */
export function displayFieldError(
  input: HTMLElement,
  error: string | null
): void {
  injectStyles();

  const wrapper = input.closest(".form-field");
  if (!wrapper) return;

  // Remove any existing error message
  const existing = wrapper.querySelector(".field-error");
  if (existing) existing.remove();
  wrapper.classList.remove("form-field--invalid");

  // Add new error if present
  if (error !== null) {
    wrapper.classList.add("form-field--invalid");
    const errorEl = document.createElement("div");
    errorEl.className = "field-error";
    errorEl.textContent = error;
    wrapper.appendChild(errorEl);
  }
}

/**
 * Shows an error summary above a form — a list of all validation errors.
 * Clears any previous summary first.
 */
export function displayFormErrors(
  form: HTMLFormElement,
  errors: string[]
): void {
  injectStyles();
  clearFormErrors(form);

  if (errors.length === 0) return;

  const summary = document.createElement("div");
  summary.className = "form-errors";
  summary.innerHTML = `<ul>${errors.map((e) => `<li>${escapeText(e)}</li>`).join("")}</ul>`;

  // Insert before the first child of the form
  form.insertBefore(summary, form.firstChild);
}

/**
 * Clears the error summary above a form.
 */
export function clearFormErrors(form: HTMLFormElement): void {
  const existing = form.querySelector(".form-errors");
  if (existing) existing.remove();
}

/**
 * Clears all field-level errors inside a form.
 */
export function clearAllFieldErrors(form: HTMLFormElement): void {
  for (const el of form.querySelectorAll(".field-error")) {
    el.remove();
  }
  for (const el of form.querySelectorAll(".form-field--invalid")) {
    el.classList.remove("form-field--invalid");
  }
}

/** Prevents HTML injection in error messages. */
function escapeText(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
