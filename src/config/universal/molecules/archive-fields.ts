// src/config/universal/molecules/archive-fields.ts
// Archive lifecycle fields shared by all entities that support archiving.
// Both fields exist in DB and are auto-managed by applyStatusAction() in L2.

export const ARCHIVE_FIELDS = [
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
