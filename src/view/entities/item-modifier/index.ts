// src/view/entities/modifier/index.ts
// Custom modifier pages — detail and edit pages use tabbed layout (Screens 1-4).
// Create and duplicate pages stay single-screen (no tabs — modifier must exist first).
// List page stays generic (no tiers on list view).

import type { FormView, DetailView, ListView, SelectOption } from "@view-service/types";
import type { TierFormRow, TierDetailRow, TierFieldMeta } from "@view-service/types";
import type { BindingDetailRow, AssignmentPanelData } from "@view-service/types";
import { mainLayout } from "../../organisms/layouts";
import { pageHeader, formSection, detailSection, dataTable, tabBar } from "../../molecules";
import { tabPanel } from "../../atoms";
import { link, deleteForm, filterSelect, ICON_EDIT, ICON_COPY } from "../../sub-atoms";
import { tierFormSection } from "./tier-form-section";
import { tierDetailSection } from "./tier-detail-section";
import { bindingDetailPanel } from "./binding-detail-panel";
import { assignmentDetailPanel } from "./assignment-detail-panel";
import { statusFormSection } from "./status-form-section";
import { statusBadge } from "./status-badge";
import { ITEM_MODIFIER_TABS } from "./item-modifier-tabs";

type ModifierFormView = FormView & {
  readonly tierRows: readonly TierFormRow[];
  readonly tierFieldMeta: readonly TierFieldMeta[];
  readonly currentState: "active" | "disabled" | "archived";
  readonly categoryBindings?: readonly BindingDetailRow[];
  readonly subcategoryBindings?: readonly BindingDetailRow[];
  readonly assignments?: AssignmentPanelData;
  readonly archivedReason?: string;
  readonly statusReason?: string;
};

type ModifierDetailView = DetailView & {
  readonly tierRows: readonly TierDetailRow[];
  readonly categoryBindings: readonly BindingDetailRow[];
  readonly subcategoryBindings: readonly BindingDetailRow[];
  readonly assignments: AssignmentPanelData;
  readonly isActive: boolean;
  readonly archivedAt?: string;
  readonly archivedReason?: string;
};

const PLACEHOLDER = '<p class="tab-placeholder">This screen is not yet implemented.</p>';

// ── Filter bar types and helpers ──────────────────────────────────────────

export interface ItemModifierFilterOptions {
  readonly domainOptions: readonly SelectOption[];
  readonly subdomainOptions: readonly SelectOption[];
  readonly categoryOptions: readonly SelectOption[];
  readonly subcategoryOptions: readonly SelectOption[];
}

export function listPage(
  view: ListView,
  basePath: string,
  filterOptions: ItemModifierFilterOptions,
  filterValues: Record<string, string | undefined>,
): string {
  const filterParams = Object.entries(filterValues)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");
  const paginationBasePath = filterParams ? `${basePath}?${filterParams}` : basePath;
  const hasFilters = filterParams.length > 0;

  const filterBar = `
    <form method="GET" action="${basePath}" class="filter-bar">
      ${filterSelect("game_domain_id", "All Domains", filterOptions.domainOptions, filterValues["game_domain_id"])}
      ${filterSelect("game_subdomain_id", "All Subdomains", filterOptions.subdomainOptions, filterValues["game_subdomain_id"])}
      ${filterSelect("game_category_id", "All Categories", filterOptions.categoryOptions, filterValues["game_category_id"])}
      ${filterSelect("game_subcategory_id", "All Subcategories", filterOptions.subcategoryOptions, filterValues["game_subcategory_id"])}
      <button type="submit" class="btn btn--primary btn--small">Filter</button>
      ${hasFilters ? `<a href="${basePath}" class="btn btn--secondary btn--small">Clear</a>` : ""}
    </form>`;

  const content = `
    ${pageHeader({ title: view.title })}
    <div class="list-toolbar">
      <a href="${basePath}/new" class="btn btn--primary" title="New">+</a>
    </div>
    ${filterBar}
    ${dataTable(view, basePath, paginationBasePath)}`;

  return mainLayout(content, view.title, basePath);
}

/** Filters is_active out of form fields — rendered by statusFormSection instead. */
function withoutStatusField(view: ModifierFormView): ModifierFormView {
  return { ...view, fields: view.fields.filter((f) => f.name !== "is_active") };
}

export function createPage(
  view: ModifierFormView,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const statusHtml = statusFormSection(view.currentState, view.statusReason);
  const tierHtml = tierFormSection(view.tierRows, view.tierFieldMeta);
  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: "Modifiers", href: basePath }, { label: "New" }],
    })}
    ${formSection(withoutStatusField(view), basePath, basePath, fieldConfigJson, `${statusHtml}${tierHtml}`)}`;
  return mainLayout(content, view.title, basePath);
}

export function editPage(
  view: ModifierFormView,
  id: string,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const reasonValue = view.currentState === "archived" ? (view.archivedReason ?? "") : (view.statusReason ?? "");
  const statusHtml = statusFormSection(view.currentState, reasonValue);
  const tierHtml = tierFormSection(view.tierRows, view.tierFieldMeta);
  const bindingsHtml = view.categoryBindings && view.subcategoryBindings
    ? bindingDetailPanel(view.categoryBindings, view.subcategoryBindings)
    : PLACEHOLDER;
  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: "Modifiers", href: basePath }, { label: view.title }],
    })}
    ${tabBar(ITEM_MODIFIER_TABS)}
    ${tabPanel("definition", `
      ${formSection(withoutStatusField(view), `${basePath}/${id}`, `${basePath}/${id}`, fieldConfigJson, `${statusHtml}${tierHtml}`)}
      <div style="margin-top:1rem; max-width:1100px">
        ${link("Duplicate", `${basePath}/${id}/duplicate`, "secondary", ICON_COPY, true)}
      </div>
    `, true)}
    ${tabPanel("bindings", bindingsHtml, false)}
    ${tabPanel("assignments", view.assignments ? assignmentDetailPanel(view.assignments) : PLACEHOLDER, false)}`;
  return mainLayout(content, view.title, basePath);
}

export function duplicatePage(
  view: ModifierFormView,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const statusHtml = statusFormSection("active");
  const tierHtml = tierFormSection(view.tierRows, view.tierFieldMeta);
  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: "Modifiers", href: basePath }, { label: "Duplicate" }],
    })}
    <div class="duplicate-notice">
      <strong>Duplicating entry.</strong> Update the Name and Description before saving.
    </div>
    ${formSection(withoutStatusField(view), basePath, basePath, fieldConfigJson, `${statusHtml}${tierHtml}`)}`;
  return mainLayout(content, view.title, basePath);
}

export function detailPage(
  view: ModifierDetailView,
  id: string,
  basePath: string,
): string {
  const bindingsHtml = bindingDetailPanel(view.categoryBindings, view.subcategoryBindings);
  const definitionActions = `
    <div class="definition-actions" style="margin-top:1.5rem">
      ${link("Edit", `${basePath}/${id}/edit`, "secondary", ICON_EDIT, true)}
      ${link("Duplicate", `${basePath}/${id}/duplicate`, "secondary", ICON_COPY, true)}
      ${deleteForm(`${basePath}/${id}/delete`, "Delete", false, true)}
    </div>`;
  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: "Modifiers", href: basePath }, { label: view.title }],
    })}
    ${tabBar(ITEM_MODIFIER_TABS)}
    ${tabPanel("definition", `${detailSection({ ...view, fields: view.fields.filter((f) => !["is_active","archived_at","archived_reason"].includes(f.name)) })}${statusBadge(view.isActive, view.archivedAt, view.archivedReason)}${tierDetailSection(view.tierRows)}${definitionActions}`, true)}
    ${tabPanel("bindings", bindingsHtml, false)}
    ${tabPanel("assignments", assignmentDetailPanel(view.assignments), false)}`;
  return mainLayout(content, view.title, basePath);
}
