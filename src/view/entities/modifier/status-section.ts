// src/view/entities/modifier/status-section.ts
// Status form widget and read-only status badge for the Modifier entity.
// The form widget renders a 3-state radio (Active / Disabled / Archived).
// status_action + status_reason are stripped before DB writes by applyStatusAction() in the service.

import { escapeHtml } from "../../sub-atoms";

/**
 * Renders the status editing section — a 3-state radio replacing the is_active checkbox.
 * CSS :has() on .status-section--form reveals the reason textarea for Disabled/Archived.
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

/**
 * Renders a read-only status badge for the detail page.
 * Derives 3-state status from isActive + archivedAt.
 */
export function statusBadge(
  isActive: boolean,
  archivedAt?: string,
  archivedReason?: string,
): string {
  if (archivedAt) {
    const reasonHtml = archivedReason
      ? `<p class="status-section__archive-reason">${escapeHtml(archivedReason)}</p>`
      : "";
    return `
      <div class="status-section">
        <div class="status-section__signal">
          <span class="status-dot status-dot--archived"></span>
          <span class="lifecycle-label lifecycle--archived" style="margin-left:0.5rem">Archived</span>
        </div>
        ${reasonHtml ? `<div class="status-section__archive"><span class="status-section__archive-label">Reason:</span>${reasonHtml}</div>` : ""}
      </div>`;
  }
  if (!isActive) {
    return `
      <div class="status-section">
        <div class="status-section__signal">
          <span class="status-dot status-dot--inactive"></span>
          <span class="lifecycle-label lifecycle--deactivated" style="margin-left:0.5rem">Disabled</span>
        </div>
      </div>`;
  }
  return `
    <div class="status-section">
      <div class="status-section__signal">
        <span class="status-dot status-dot--active"></span>
        <span class="lifecycle-label lifecycle--active" style="margin-left:0.5rem">Active</span>
      </div>
    </div>`;
}
