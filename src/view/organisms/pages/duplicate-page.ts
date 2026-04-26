// src/view/organisms/pages/duplicate-page.ts
// Pre-filled create form for duplicating an existing entity.
// Renders the same form as create but with values from the source record.

import type { FormView } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader, formSection, statusFormSection } from "../../molecules";

export function duplicatePage(view: FormView, basePath: string, fieldConfigJson?: string): string {
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
      breadcrumbs: [{ label: listName, href: basePath }, { label: "Duplicate" }],
    })}
    <div class="duplicate-notice">
      <strong>Duplicating entry.</strong> Update the Name and Description before saving.
    </div>
    ${formSection(displayView, basePath, basePath, fieldConfigJson, extra)}`;

  return mainLayout(content, view.title, basePath);
}
