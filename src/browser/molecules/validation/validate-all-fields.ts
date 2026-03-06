// src/browser/molecules/validation/validate-all-fields.ts
// Form-level validation molecule — validates every field and collects errors.

import type { BrowserFieldConfig } from "@config/types";
import { buildFieldValidator } from "../../atoms/validation";
import { displayFieldError } from "../ui";

export function validateAllFields(
  form: HTMLFormElement,
  fields: readonly BrowserFieldConfig[],
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
