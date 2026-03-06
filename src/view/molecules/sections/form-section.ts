// src/view/molecules/sections/form-section.ts

import type { FormView } from "@view-service/types";
import { submitButton, link } from "../../sub-atoms";
import { formField } from "../../atoms";

/**
 * Renders a complete HTML form from a FormView model.
 * action is the URL the form POSTs to.
 * cancelUrl is the back link shown next to the submit button.
 * fieldConfigJson embeds Layer 0 field config for browser-side validation.
 */
export function formSection(
  view: FormView,
  action: string,
  cancelUrl: string,
  fieldConfigJson?: string,
): string {
  const configTag = fieldConfigJson
    ? `<script id="field-config" type="application/json">${fieldConfigJson}</script>`
    : "";

  return `
    <form method="POST" action="${action}" class="entity-form">
      ${configTag}
      ${view.fields.map((f) => formField(f)).join("")}
      <div class="form-actions">
        ${submitButton("Save")}
        ${link("Cancel", cancelUrl, "secondary")}
      </div>
    </form>`;
}
