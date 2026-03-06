// src/view/organisms/pages/edit-page.ts

import type { FormView } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader, formSection } from "../../molecules";

export function editPage(view: FormView, id: string, basePath: string): string {
  const content = `
    ${pageHeader({ title: view.title, backUrl: `${basePath}/${id}` })}
    ${formSection(view, `${basePath}/${id}`, `${basePath}/${id}`)}`;

  return mainLayout(content, view.title, basePath);
}
