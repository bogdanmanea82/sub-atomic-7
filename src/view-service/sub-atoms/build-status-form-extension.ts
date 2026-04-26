// src/view-service/sub-atoms/build-status-form-extension.ts
// Derives the shared status fields merged into every form view.
// Shared by all entity view-services that use the status form section.

import { deriveCurrentState } from "./derive-current-state";

export function buildStatusFormExtension(values?: Record<string, unknown>): {
  readonly currentState: "active" | "disabled" | "archived";
  readonly statusReason?: string;
} {
  return {
    currentState: deriveCurrentState(values),
    statusReason: String(values?.["archived_reason"] ?? "") || undefined,
  };
}
