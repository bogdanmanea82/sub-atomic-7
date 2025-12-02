import { CREATED_AT_FIELD_ATOM } from "../atoms/created-at-field-atom";
import { UPDATED_AT_FIELD_ATOM } from "../atoms/updated-at-field-atom";
// src/config/universal/molecules/audit-fields.ts
// Audit timestamp fields for tracking record history

/**
 * Audit fields molecule.
 * Timestamp tracking for record creation and modification.
 */
export const AUDIT_FIELDS = [
  CREATED_AT_FIELD_ATOM,
  UPDATED_AT_FIELD_ATOM,
] as const;
