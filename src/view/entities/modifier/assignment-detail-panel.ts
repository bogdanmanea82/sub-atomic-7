// src/view/entities/modifier/assignment-detail-panel.ts
// Renders the Assignments tab (Screen 3) — read-only resolved eligibility view.
// Shows which subcategories this modifier is eligible for, grouped by category.

import type { AssignmentPanelData, AssignmentCategoryGroup, ResolvedAssignment } from "@view-service/types";
import { escapeHtml } from "../../sub-atoms";

function statusBadge(status: ResolvedAssignment["status"]): string {
  switch (status) {
    case "included":
      return '<span class="badge badge--active">Eligible</span>';
    case "excluded":
      return '<span class="badge badge--inactive">Excluded</span>';
    case "none":
      return '<span class="badge badge--muted">No binding</span>';
  }
}

function sourceBadge(source: ResolvedAssignment["source"]): string {
  switch (source) {
    case "explicit":
      return '<span class="assignment-source assignment-source--explicit">Explicit</span>';
    case "category-inherited":
      return '<span class="assignment-source assignment-source--inherited">Inherited</span>';
    case "none":
      return "";
  }
}

function categoryStatusLabel(status: AssignmentCategoryGroup["categoryBinding"]): string {
  switch (status) {
    case "included":
      return '<span class="badge badge--active badge--small">Included</span>';
    case "excluded":
      return '<span class="badge badge--inactive badge--small">Excluded</span>';
    case "none":
      return '<span class="badge badge--muted badge--small">No binding</span>';
  }
}

function assignmentRow(row: ResolvedAssignment): string {
  return `
    <tr class="assignment-row assignment-row--${row.status}">
      <td>${escapeHtml(row.subcategoryName)}</td>
      <td>${statusBadge(row.status)}</td>
      <td>${sourceBadge(row.source)}</td>
      <td>${escapeHtml(row.weightOverride)}</td>
      <td>${escapeHtml(row.tierRange)}</td>
      <td>${escapeHtml(row.levelReqOverride)}</td>
    </tr>`;
}

function categoryGroup(group: AssignmentCategoryGroup): string {
  if (group.assignments.length === 0) {
    return `
      <div class="assignment-group">
        <h4 class="assignment-group__header">
          ${escapeHtml(group.categoryName)} ${categoryStatusLabel(group.categoryBinding)}
        </h4>
        <p class="assignment-empty">No subcategories in this category.</p>
      </div>`;
  }

  const rows = group.assignments.map(assignmentRow).join("");

  return `
    <div class="assignment-group">
      <h4 class="assignment-group__header">
        ${escapeHtml(group.categoryName)} ${categoryStatusLabel(group.categoryBinding)}
      </h4>
      <table class="data-table assignment-table">
        <thead>
          <tr>
            <th>Subcategory</th>
            <th>Status</th>
            <th>Source</th>
            <th>Weight</th>
            <th>Tier Range</th>
            <th>Level Req</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function summaryBar(data: AssignmentPanelData): string {
  const { summary } = data;

  if (summary.totalSubcategories === 0) {
    return `<p class="assignment-empty">No categories or subcategories exist yet.</p>`;
  }

  return `
    <div class="assignment-summary">
      <div class="assignment-summary__stat assignment-summary__stat--eligible">
        <span class="assignment-summary__count">${summary.eligible}</span>
        <span class="assignment-summary__label">Eligible</span>
      </div>
      <div class="assignment-summary__stat assignment-summary__stat--excluded">
        <span class="assignment-summary__count">${summary.excluded}</span>
        <span class="assignment-summary__label">Excluded</span>
      </div>
      <div class="assignment-summary__stat assignment-summary__stat--none">
        <span class="assignment-summary__count">${summary.noBinding}</span>
        <span class="assignment-summary__label">No binding</span>
      </div>
      <div class="assignment-summary__stat assignment-summary__stat--total">
        <span class="assignment-summary__count">${summary.totalSubcategories}</span>
        <span class="assignment-summary__label">Total</span>
      </div>
    </div>`;
}

export function assignmentDetailPanel(data: AssignmentPanelData): string {
  const groups = data.groups.map(categoryGroup).join("");

  return `
    <div class="assignment-panel">
      <p class="assignment-panel__description">
        Resolved eligibility based on category and subcategory bindings.
        Subcategories inherit from their parent category unless explicitly overridden.
      </p>
      ${summaryBar(data)}
      ${groups}
    </div>`;
}
