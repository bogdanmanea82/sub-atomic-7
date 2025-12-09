// src/model/universal/sub-atoms/validation/validate-string-length.ts
// Validates that a string value falls within min/max length bounds

export function validateStringLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): string {
  if (value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }

  if (value.length > maxLength) {
    throw new Error(
      `${fieldName} must be no more than ${maxLength} characters`
    );
  }

  return value;
}
