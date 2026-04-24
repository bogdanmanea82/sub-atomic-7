// src/config/universal/atoms/machine-name-field-atom.ts
// Machine-readable snake_case identifier field.
// Distinct from NAME_FIELD_ATOM (human display) — this is the stable
// programmatic key used for FK references and engine dispatch.

import {
  DISPLAY_FORMATS,
  FIELD_MARKERS,
  STRING_CONSTRAINTS,
} from "../sub-atoms";

export const MACHINE_NAME_FIELD_ATOM = {
  name: "machine_name",
  type: "string",
  label: "Machine Name",
  ...STRING_CONSTRAINTS.short,
  pattern: "^[a-z][a-z0-9_]*$",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.text,
} as const;
