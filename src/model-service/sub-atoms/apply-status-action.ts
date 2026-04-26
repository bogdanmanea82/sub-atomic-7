// src/model-service/sub-atoms/apply-status-action.ts
// Translates the status_action radio value into DB field values.
// No-op when status_action is absent — preserves is_active for callers
// that pass it directly (e.g. API tests with JSON bodies).

export function applyStatusAction(data: Record<string, unknown>): void {
  const action = data["status_action"];
  if (action === undefined) return;

  if (action === "disabled") {
    data["is_active"] = false;
    data["archived_reason"] = null;
    data["archived_at"] = null;
  } else if (action === "archived") {
    data["is_active"] = false;
    const reason = data["status_reason"];
    data["archived_reason"] = typeof reason === "string" && reason.trim() ? reason.trim() : null;
    data["archived_at"] = data["archived_reason"] ? new Date().toISOString() : null;
  } else {
    data["is_active"] = true;
    data["archived_reason"] = null;
    data["archived_at"] = null;
  }
}
