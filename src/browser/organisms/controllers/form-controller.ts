// src/browser/organisms/controllers/form-controller.ts
// Wires form validation and submission for create/edit pages.
// Orchestrates: validation sub-atoms + handler atoms + UI molecules.

import type { BrowserFieldConfig } from "@config/types";
export type { BrowserFieldConfig };
import { attachFormSubmitHandler, attachInputChangeHandler } from "../../atoms/handlers";
import { buildFieldValidator } from "../../atoms/validation";
import { setFlashMessage } from "../../sub-atoms/utilities";
import {
  showToast,
  showLoading,
  hideLoading,
  displayFieldError,
  displayFormErrors,
  clearFormErrors,
  clearAllFieldErrors,
} from "../../molecules/ui";
import { validateAllFields } from "../../molecules/validation";

export interface FormControllerOptions {
  readonly formSelector: string;
  readonly apiUrl: string;
  readonly method: "POST" | "PUT";
  readonly redirectUrl: string;
  readonly fields: readonly BrowserFieldConfig[];
  readonly successMessage: string;
}

/**
 * Initializes form enhancement for a create or edit page.
 * Attaches real-time validation to each field and intercepts form submission.
 * If the form element doesn't exist on the page, does nothing (safe to call always).
 */
export function initFormController(options: FormControllerOptions): void {
  const form = document.querySelector<HTMLFormElement>(options.formSelector);
  if (!form) return;

  // Attach per-field real-time validation
  for (const fieldConfig of options.fields) {
    const input = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[name="${fieldConfig.name}"]`
    );
    if (!input) continue;

    const validator = buildFieldValidator(fieldConfig);
    attachInputChangeHandler(input, fieldConfig.label, validator, displayFieldError);
  }

  // Attach form submit handler
  attachFormSubmitHandler(form, options.apiUrl, options.method, {
    onValidate: (f) => {
      clearAllFieldErrors(f);
      clearFormErrors(f);
      return validateAllFields(f, options.fields);
    },
    onErrors: (errors) => displayFormErrors(form, errors),
    onLoading: (loading) => (loading ? showLoading() : hideLoading()),
    onSuccess: () => {
      setFlashMessage(options.successMessage, "success");
      window.location.href = options.redirectUrl;
    },
    onError: (message) => {
      showToast(message, "error");
    },
  });
}
