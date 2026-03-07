// src/browser/atoms/validation/build-field-validator.ts
// Builds a FieldValidator function from a BrowserFieldConfig.
// Orchestrates validation sub-atoms without implementing logic.

import type { BrowserFieldConfig } from "@config/types";
import {
  validateRequired,
  validateStringLength,
  validateIntegerRange,
  validatePattern,
} from "../../sub-atoms/validation";
import type { FieldValidator } from "../handlers";

export function buildFieldValidator(fieldConfig: BrowserFieldConfig): FieldValidator {
  return (value: string, fieldLabel: string): string | null => {
    if (fieldConfig.required) {
      const requiredError = validateRequired(value, fieldLabel);
      if (requiredError !== null) return requiredError;
    }

    if (value.trim() === "") return null;

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

    if (fieldConfig.type === "enum" && fieldConfig.values) {
      if (!fieldConfig.values.includes(value)) {
        return `${fieldLabel} must be one of: ${fieldConfig.values.join(", ")}`;
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

    if (fieldConfig.type === "decimal") {
      const num = parseFloat(value);
      if (Number.isNaN(num)) return `${fieldLabel} must be a valid number`;
      if (fieldConfig.min !== undefined && num < fieldConfig.min) {
        return `${fieldLabel} must be at least ${fieldConfig.min}`;
      }
      if (fieldConfig.max !== undefined && num > fieldConfig.max) {
        return `${fieldLabel} must be at most ${fieldConfig.max}`;
      }
    }

    return null;
  };
}
