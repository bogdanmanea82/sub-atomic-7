// src/view/organisms/pages/detail-page.ts

import type { DetailView } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader, detailSection } from "../../molecules";
import { link } from "../../sub-atoms";

export function detailPage(view: DetailView, id: string, basePath: string): string {
  const content = `
    ${pageHeader({ title: view.title, backUrl: basePath })}
    ${detailSection(view)}
    <div class="form-actions" style="margin-top:1.5rem">
      ${link("Edit", `${basePath}/${id}/edit`, "secondary", "✏️")}
      ${link("Duplicate", `${basePath}/${id}/duplicate`, "secondary", "📋")}
      <form method="POST" action="${basePath}/${id}/delete" style="display:inline">
        <button type="submit" class="btn btn--danger">Delete</button>
      </form>
    </div>`;

  return mainLayout(content, view.title, basePath);
}
