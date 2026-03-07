// src/view/entities/modifier/index.ts
// Custom modifier pages — form pages include tier section, detail page includes tier table.
// List page stays generic (no tiers on list view).

import type { FormView, DetailView } from "@view-service/types";
import type { TierFormRow, TierDetailRow, TierFieldMeta } from "@view-service/types";
import { mainLayout } from "../../organisms/layouts";
import { pageHeader, formSection, detailSection } from "../../molecules";
import { link, deleteForm } from "../../sub-atoms";
import { tierFormSection } from "./tier-form-section";
import { tierDetailSection } from "./tier-detail-section";

export { listPage } from "../../organisms/pages";

type ModifierFormView = FormView & {
  readonly tierRows: readonly TierFormRow[];
  readonly tierFieldMeta: readonly TierFieldMeta[];
};

type ModifierDetailView = DetailView & {
  readonly tierRows: readonly TierDetailRow[];
};

export function createPage(
  view: ModifierFormView,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const tierHtml = tierFormSection(view.tierRows, view.tierFieldMeta);
  const content = `
    ${pageHeader({ title: view.title, backUrl: basePath })}
    ${formSection(view, basePath, basePath, fieldConfigJson, tierHtml)}`;
  return mainLayout(content, view.title, basePath);
}

export function editPage(
  view: ModifierFormView,
  id: string,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const tierHtml = tierFormSection(view.tierRows, view.tierFieldMeta);
  const content = `
    ${pageHeader({ title: view.title, backUrl: `${basePath}/${id}` })}
    ${formSection(view, `${basePath}/${id}`, `${basePath}/${id}`, fieldConfigJson, tierHtml)}
    <div style="margin-top:1rem; max-width:640px">
      ${link("Duplicate", `${basePath}/${id}/duplicate`, "secondary", "📋")}
    </div>`;
  return mainLayout(content, view.title, basePath);
}

export function duplicatePage(
  view: ModifierFormView,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const tierHtml = tierFormSection(view.tierRows, view.tierFieldMeta);
  const content = `
    ${pageHeader({ title: view.title, backUrl: basePath })}
    <div class="duplicate-notice">
      <strong>Duplicating entry.</strong> Update the Name and Description before saving.
    </div>
    ${formSection(view, basePath, basePath, fieldConfigJson, tierHtml)}`;
  return mainLayout(content, view.title, basePath);
}

export function detailPage(
  view: ModifierDetailView,
  id: string,
  basePath: string,
): string {
  const content = `
    ${pageHeader({ title: view.title, backUrl: basePath })}
    ${detailSection(view)}
    ${tierDetailSection(view.tierRows)}
    <div class="form-actions" style="margin-top:1.5rem">
      ${link("Edit", `${basePath}/${id}/edit`, "secondary", "✏️")}
      ${link("Duplicate", `${basePath}/${id}/duplicate`, "secondary", "📋")}
      ${deleteForm(`${basePath}/${id}/delete`)}
    </div>`;
  return mainLayout(content, view.title, basePath);
}
