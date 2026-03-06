// src/view/molecules/sections/form-section.ts

import type { FormView } from "@view-service/types";
import { submitButton, link } from "../../sub-atoms";
import { formField } from "../../atoms";

/**
 * Renders a complete HTML form from a FormView model.
 * action is the URL the form POSTs to.
 * cancelUrl is the back link shown next to the submit button.
 */
export function formSection(view: FormView, action: string, cancelUrl: string): string {
  return `
    <form method="POST" action="${action}" class="entity-form">
      ${view.fields.map((f) => formField(f)).join("")}
      <div class="form-actions">
        ${submitButton("Save")}
        ${link("Cancel", cancelUrl, "secondary")}
      </div>
    </form>`;
}
