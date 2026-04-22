// src/config/molecules/modifier/archive-fields.ts
// Archive lifecycle fields for modifier domain types.
//
// Both fields exist in the DB schema and are auto-managed by L2:
//   archived_at is set when archived_reason is provided, cleared when removed.
// Both are hidden from all forms and lists (showInForm/showInList: false).
//
// Deferred Observability layer — a future archive workflow will surface these
// fields with an explicit reason requirement and audit trail.

export const MODIFIER_ARCHIVE_FIELDS = [
  {
    type: "timestamp",
    name: "archived_at",
    label: "Archived At",
    autoSet: "none",
    required: false,
    displayFormat: "datetime",
    showInList: false,
    showInForm: false,
  },
  {
    type: "string",
    name: "archived_reason",
    label: "Archive Reason",
    minLength: 0,
    maxLength: 500,
    required: false,
    displayFormat: "textarea",
    showInList: false,
    showInForm: false,
  },
] as const;
