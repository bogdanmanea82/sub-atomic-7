// src/view/organisms/pages/create-page.ts

import type { FormView } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader, formSection } from "../../molecules";

export function createPage(view: FormView, basePath: string, fieldConfigJson?: string): string {
  const listName = basePath.slice(1).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const content = `
    ${pageHeader({
      title: view.title,
      breadcrumbs: [{ label: listName, href: basePath }, { label: "New" }],
    })}
    ${formSection(view, basePath, basePath, fieldConfigJson)}`;

  return mainLayout(content, view.title, basePath);
}
