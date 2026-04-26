// src/view/organisms/pages/detail-page.ts

import type { DetailView } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader, detailSection } from "../../molecules";
import { link, deleteForm, ICON_EDIT, ICON_COPY, statusBadgeInline } from "../../sub-atoms";

export function detailPage(view: DetailView, id: string, basePath: string): string {
  // Derive display name for breadcrumb from basePath (e.g. "/game-domains" → "Game Domains")
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
    ${detailSection(view)}`;

  return mainLayout(content, view.title, basePath);
}
