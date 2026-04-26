// src/view/entities/character-class/index.ts
// Custom CharacterClass pages — all pages include the stat sheet section.
// List page uses the generic organism (no stat sheet on list view).

import type { CharacterClassFormView, CharacterClassDetailView } from "@view-service/types";
import { mainLayout } from "../../organisms/layouts";
import { pageHeader, formSection, detailSection, statusFormSection } from "../../molecules";
import { link, deleteForm, ICON_EDIT, ICON_COPY, statusBadgeInline } from "../../sub-atoms";
import { statSheetFormSection } from "./stat-sheet-form-section";
import { statSheetDetailSection } from "./stat-sheet-detail-section";

export { listPage } from "../../organisms/pages";

export function detailPage(
  view: CharacterClassDetailView,
  id: string,
  basePath: string,
): string {
  const listName = basePath.slice(1).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const actions = `
    ${link("Edit", `${basePath}/${id}/edit`, "secondary", ICON_EDIT, true)}
    ${link("Duplicate", `${basePath}/${id}/duplicate`, "secondary", ICON_COPY, true)}
    ${deleteForm(`${basePath}/${id}/delete`, "Delete", false, true)}`;

  const content = `
    ${pageHeader({
      title: view.title,
      badge: view.isActive !== undefined ? statusBadgeInline(view.isActive, view.archivedAt) : undefined,
      breadcrumbs: [{ label: listName, href: basePath }, { label: view.title }],
      actions,
    })}
    ${detailSection(view)}
    ${statSheetDetailSection(view.statSheet)}`;

  return mainLayout(content, view.title, basePath);
}

export function createPage(
  view: CharacterClassFormView,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const listName = basePath.slice(1).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const displayView = view.currentState !== undefined
    ? { ...view, fields: view.fields.filter((f) => f.name !== "is_active") }
    : view;
  const statusHtml = view.currentState !== undefined
    ? statusFormSection(view.currentState, view.statusReason)
    : "";

  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: listName, href: basePath }, { label: "New" }],
    })}
    ${formSection(displayView, basePath, basePath, fieldConfigJson, `${statusHtml}${statSheetFormSection(view.statSheet)}`)}`;

  return mainLayout(content, view.title, basePath);
}

export function editPage(
  view: CharacterClassFormView,
  id: string,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const listName = basePath.slice(1).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const displayView = view.currentState !== undefined
    ? { ...view, fields: view.fields.filter((f) => f.name !== "is_active") }
    : view;
  const statusHtml = view.currentState !== undefined
    ? statusFormSection(view.currentState, view.statusReason)
    : "";

  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: listName, href: basePath }, { label: view.title }],
    })}
    ${formSection(displayView, `${basePath}/${id}`, `${basePath}/${id}`, fieldConfigJson, `${statusHtml}${statSheetFormSection(view.statSheet)}`)}
    <div style="margin-top:1rem; max-width:1100px">
      ${link("Duplicate", `${basePath}/${id}/duplicate`, "secondary", ICON_COPY, true)}
    </div>`;

  return mainLayout(content, view.title, basePath);
}

export function duplicatePage(
  view: CharacterClassFormView,
  basePath: string,
  fieldConfigJson?: string,
): string {
  const listName = basePath.slice(1).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const displayView = { ...view, fields: view.fields.filter((f) => f.name !== "is_active") };
  const statusHtml = statusFormSection("active");

  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: listName, href: basePath }, { label: "Duplicate" }],
    })}
    <div class="duplicate-notice">
      <strong>Duplicating entry.</strong> Update the Name and Machine Name before saving.
    </div>
    ${formSection(displayView, basePath, basePath, fieldConfigJson, `${statusHtml}${statSheetFormSection(view.statSheet)}`)}`;

  return mainLayout(content, view.title, basePath);
}
