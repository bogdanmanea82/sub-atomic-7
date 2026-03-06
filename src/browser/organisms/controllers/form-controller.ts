// src/browser/organisms/controllers/form-controller.ts
// Wires form validation and submission for create/edit pages.
// Orchestrates: validation sub-atoms + handler atoms + UI molecules.

import {
  validateRequired,
  validateStringLength,
  validateIntegerRange,
  validatePattern,
} from "../../sub-atoms/validation";
import { attachFormSubmitHandler, attachInputChangeHandler } from "../../atoms/handlers";
import type { FieldValidator } from "../../atoms/handlers";
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

// ── Browser-side field config ──────────────────────────────────────────────
// Minimal config needed for client-side validation.
// Mirrors Layer 0 FieldConfig but only includes what the browser uses.

export interface BrowserFieldConfig {
  readonly name: string;
  readonly label: string;
  readonly type: "string" | "integer" | "boolean" | "timestamp" | "uuid";
  readonly required: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
}

export interface FormControllerOptions {
  readonly formSelector: string;
  readonly apiUrl: string;
  readonly method: "POST" | "PUT";
  readonly redirectUrl: string;
  readonly fields: readonly BrowserFieldConfig[];
  readonly successMessage: string;
}

// ── Field validator factory ────────────────────────────────────────────────
// Builds a FieldValidator function for a specific field config.
// Runs all applicable checks and returns the first error found.

function buildFieldValidator(fieldConfig: BrowserFieldConfig): FieldValidator {
  return (value: string, fieldLabel: string): string | null => {
    // Required check
    if (fieldConfig.required) {
      const requiredError = validateRequired(value, fieldLabel);
      if (requiredError !== null) return requiredError;
    }

    // Skip further checks if empty and optional
    if (value.trim() === "") return null;

    // Type-specific checks
    if (fieldConfig.type === "string") {
      if (fieldConfig.minLength !== undefined && fieldConfig.maxLength !== undefined) {
        const lengthError = validateStringLength(
          value, fieldConfig.minLength, fieldConfig.maxLength, fieldLabel
        );
        if (lengthError !== null) return lengthError;
      }
      if (fieldConfig.pattern !== undefined) {
        const patternError = validatePattern(value, fieldConfig.pattern, fieldLabel);
        if (patternError !== null) return patternError;
      }
    }

    if (fieldConfig.type === "integer") {
      if (fieldConfig.min !== undefined && fieldConfig.max !== undefined) {
        const rangeError = validateIntegerRange(
          value, fieldConfig.min, fieldConfig.max, fieldLabel
        );
        if (rangeError !== null) return rangeError;
      }
    }

    return null;
  };
}

// ── Form-level validation ──────────────────────────────────────────────────
// Validates all fields and returns collected errors.

function validateAllFields(
  form: HTMLFormElement,
  fields: readonly BrowserFieldConfig[]
): string[] {
  const errors: string[] = [];

  for (const fieldConfig of fields) {
    const input = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[name="${fieldConfig.name}"]`
    );
    if (!input) continue;

    const validator = buildFieldValidator(fieldConfig);
    const error = validator(input.value, fieldConfig.label);
    displayFieldError(input, error);
    if (error !== null) errors.push(error);
  }

  return errors;
}

// ── Controller initialization ──────────────────────────────────────────────

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
