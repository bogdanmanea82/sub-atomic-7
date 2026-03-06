// src/view/organisms/pages/create-page.ts

import type { FormView } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader, formSection } from "../../molecules";

export function createPage(view: FormView, basePath: string): string {
  const content = `
    ${pageHeader({ title: view.title, backUrl: basePath })}
    ${formSection(view, basePath, basePath)}`;

  return mainLayout(content, view.title, basePath);
}
