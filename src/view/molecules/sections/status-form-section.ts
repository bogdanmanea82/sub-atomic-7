// src/view/molecules/sections/status-form-section.ts
// Renders the status editing widget — a 3-state radio (Active / Disabled / Archived).
// status_action is stripped before DB writes by applyStatusAction() in L2.

import { escapeHtml } from "../../sub-atoms";

/**
 * Renders the status editing section used in create / edit forms.
 * CSS :has() on .status-section--form reveals the reason textarea
 * when Disabled or Archived is selected.
 */
export function statusFormSection(
  currentState: "active" | "disabled" | "archived",
  reasonValue?: string,
): string {
  const reason = escapeHtml(reasonValue ?? "");
  return `
    <fieldset class="status-section status-section--form">
      <legend>Status</legend>
      <div class="status-options">
        <label class="status-option">
          <input type="radio" name="status_action" value="active"${currentState === "active" ? " checked" : ""}>
          <span class="status-dot status-dot--active"></span>
          <span class="status-option__label">Active</span>
        </label>
        <label class="status-option">
          <input type="radio" name="status_action" value="disabled"${currentState === "disabled" ? " checked" : ""}>
          <span class="status-dot status-dot--inactive"></span>
          <span class="status-option__label">Disabled</span>
        </label>
        <label class="status-option">
          <input type="radio" name="status_action" value="archived"${currentState === "archived" ? " checked" : ""}>
          <span class="status-dot status-dot--archived"></span>
          <span class="status-option__label">Archived</span>
        </label>
      </div>
      <div class="status-reason-wrap">
        <label for="status_reason">Reason (optional)</label>
        <textarea name="status_reason" id="status_reason" rows="2" maxlength="500">${reason}</textarea>
      </div>
    </fieldset>`;
}
