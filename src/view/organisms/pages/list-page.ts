// src/view/organisms/pages/list-page.ts

import type { ListView } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader } from "../../molecules";
import { dataTable } from "../../molecules";

export function listPage(view: ListView, basePath: string): string {
  const content = `
    ${pageHeader({ title: view.title, actionLabel: "New", actionUrl: `${basePath}/new` })}
    ${dataTable(view, basePath)}`;

  return mainLayout(content, view.title, basePath);
}
