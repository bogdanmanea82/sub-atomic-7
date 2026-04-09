// src/view/sub-atoms/elements/delete-form.ts
// Renders an inline form with a danger button that POSTs to a delete action.

import { ICON_DELETE } from "./link";

export function deleteForm(action: string, label = "Delete", small = false, iconOnly = false): string {
  if (iconOnly) {
    return `<form method="POST" action="${action}" style="display:inline">
  <button type="submit" class="btn btn--danger link--icon-only" title="${label}">${ICON_DELETE}</button>
</form>`;
  }
  const sizeClass = small ? " btn--small" : "";
  return `<form method="POST" action="${action}" style="display:inline">
  <button type="submit" class="btn btn--danger${sizeClass}">${label}</button>
</form>`;
}
