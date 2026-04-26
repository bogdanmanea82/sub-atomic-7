// src/view/organisms/pages/edit-page.ts

import type { FormView } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader, formSection, statusFormSection } from "../../molecules";
import { link, ICON_COPY } from "../../sub-atoms";

export function editPage(view: FormView, id: string, basePath: string, fieldConfigJson?: string): string {
  const listName = basePath.slice(1).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const displayView: FormView = view.currentState !== undefined
    ? { ...view, fields: view.fields.filter((f) => f.name !== "is_active") }
    : view;
  const extra = view.currentState !== undefined
    ? statusFormSection(view.currentState, view.statusReason)
    : undefined;

  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: listName, href: basePath }, { label: view.title }],
    })}
    ${formSection(displayView, `${basePath}/${id}`, `${basePath}/${id}`, fieldConfigJson, extra)}
    <div style="margin-top:1rem; max-width:1100px">
      ${link("Duplicate", `${basePath}/${id}/duplicate`, "secondary", ICON_COPY, true)}
    </div>`;

  return mainLayout(content, view.title, basePath);
}
