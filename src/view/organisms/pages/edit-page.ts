// src/view/organisms/pages/edit-page.ts

import type { FormView } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader, formSection } from "../../molecules";
import { link } from "../../sub-atoms";

export function editPage(view: FormView, id: string, basePath: string, fieldConfigJson?: string): string {
  const content = `
    ${pageHeader({ title: view.title, backUrl: `${basePath}/${id}` })}
    ${formSection(view, `${basePath}/${id}`, `${basePath}/${id}`, fieldConfigJson)}
    <div style="margin-top:1rem; max-width:640px">
      ${link("Duplicate", `${basePath}/${id}/duplicate`, "secondary", "📋")}
    </div>`;

  return mainLayout(content, view.title, basePath);
}
