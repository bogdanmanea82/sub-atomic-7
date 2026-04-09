// src/view/organisms/pages/list-page.ts

import type { ListView } from "@view-service/types";
import { mainLayout } from "../layouts";
import { pageHeader } from "../../molecules";
import { dataTable } from "../../molecules";

export function listPage(view: ListView, basePath: string): string {
  const content = `
    ${pageHeader({ title: view.title })}
    <div class="list-toolbar">
      <a href="${basePath}/new" class="btn btn--primary" title="New">+</a>
    </div>
    ${dataTable(view, basePath)}`;

  return mainLayout(content, view.title, basePath);
}
