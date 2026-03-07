// src/config/types/browser-field-config.ts
// Single source of truth for the browser field config shape.
// Used by Layer 4 (View Service) to serialize field config as JSON,
// and by Layer 6 (Browser) to deserialize and validate against it.

import type { FieldType } from "./field-config";

export interface BrowserFieldConfig {
  readonly name: string;
  readonly label: string;
  readonly type: FieldType;
  readonly required: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
  readonly values?: readonly string[];
  readonly precision?: number;
  readonly scale?: number;
}
