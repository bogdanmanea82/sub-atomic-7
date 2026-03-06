// src/model/universal/atoms/validate-entity.ts
// Orchestrates validation sub-atoms based on entity configuration
// This atom coordinates but does not implement - sub-atoms contain the actual validation logic

import type { EntityConfig, FieldConfig } from "../../../config/types";
import { validateRequired } from "../sub-atoms/validation/validate-required";
import { validateStringLength } from "../sub-atoms/validation/validate-string-length";
import { validateIntegerRange } from "../sub-atoms/validation/validate-integer-range";
import { validateBoolean } from "../sub-atoms/validation/validate-boolean";
import { validateDatetime } from "../sub-atoms/validation/validate-datetime";

// Type for validation errors - collects all field errors before throwing
export type ValidationErrors = {
  readonly [fieldName: string]: string;
};

// Type for the validated output - same shape as input but guaranteed valid
export type ValidatedData = {
  readonly [fieldName: string]: unknown;
};

/**
 * Validates input data against entity configuration.
 * Orchestrates validation sub-atoms based on field types.
 * Collects all errors before throwing, enabling user-friendly error display.
 */

export function validateEntity(
  config: EntityConfig,
  input: Record<string, unknown>
): ValidatedData {
  const errors: Record<string, string> = {};
  const validated: Record<string, unknown> = {};

  // Iterate over each field in the entity configuration
  for (const field of config.fields) {
    // Skip auto-managed fields — these are set by the serializer or database
    if (field.type === "uuid" && field.autoGenerate) continue;
    if (field.type === "timestamp" && field.autoSet !== "none") continue;

    const value = input[field.name];

    try {
      // Validate and store the result for this field
      validated[field.name] = validateField(field, value);
    } catch (error) {
      //Collect error message - don't stop iteration
      if (error instanceof Error) {
        errors[field.name] = error.message;
      }
    }
  }

  // If any errors were collected, throw them all at once
  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed");
    (error as Error & { errors: ValidationErrors }).errors = errors;
    throw error;
  }
  return validated as ValidatedData;
}

/**
 * Validates a single field based on its configuration.
 * Uses switch on field.type to dispatch to appropriate sub-atom.
 */

function validateField(field: FieldConfig, value: unknown): unknown {
  // Step 1: Check required constraint (applies to all field types)
  if (field.required) {
    validateRequired(value, field.name);
  } else if (value === null || value === undefined) {
    // Not required and no value provided - return as-is
    return value;
  }

  // Step 2: Type-specific validation based on field.type discriminant
  switch (field.type) {
    case "string":
      return validateStringLength(
        value as string,
        field.minLength,
        field.maxLength,
        field.name
      );

    case "integer":
      return validateIntegerRange(
        value as number,
        field.min,
        field.max,
        field.name
      );

    case "boolean":
      return validateBoolean(value as boolean, field.name);

    case "timestamp":
      return validateDatetime(value as string, field.name);

    case "uuid":
      // UUID validation is typically just required check + format
      // For now, pass through - could add UUID format validation sub-atom later
      return value;

    default:
      throw new Error(`Unknown field type: ${(field as FieldConfig).type}`);
  }
}
