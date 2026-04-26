// src/view-service/sub-atoms/derive-current-state.ts
// Derives the 3-state current status from raw entity/form values.
// Shared by all entity view services that use the status form section.

/**
 * Rules (evaluated in order):
 *   1. archived_reason present and non-empty → "archived"
 *   2. is_active === true (boolean or "true" string) → "active"
 *   3. otherwise → "disabled"
 *   4. no values (new entity) → "active" (default)
 */
export function deriveCurrentState(values?: Record<string, unknown>): "active" | "disabled" | "archived" {
  if (!values) return "active";
  const archivedReason = values["archived_reason"];
  if (archivedReason != null && archivedReason !== "") return "archived";
  const isActive = values["is_active"] === true || values["is_active"] === "true";
  return isActive ? "active" : "disabled";
}
