// src/view/organisms/pages/duplicate-page.ts
// Pre-filled create form for duplicating an existing entity.
// Renders the same form as create but with values from the source record.

import type { FormView } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader, formSection } from "../../molecules";

export function duplicatePage(view: FormView, basePath: string, fieldConfigJson?: string): string {
  const listName = basePath.slice(1).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: listName, href: basePath }, { label: "Duplicate" }],
    })}
    <div class="duplicate-notice">
      <strong>Duplicating entry.</strong> Update the Name and Description before saving.
    </div>
    ${formSection(view, basePath, basePath, fieldConfigJson)}`;

  return mainLayout(content, view.title, basePath);
}
