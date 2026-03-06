// src/view/sub-atoms/elements/delete-form.ts
// Renders an inline form with a danger button that POSTs to a delete action.

export function deleteForm(action: string, label = "Delete", small = false): string {
  const sizeClass = small ? " btn--small" : "";
  return `<form method="POST" action="${action}" style="display:inline">
  <button type="submit" class="btn btn--danger${sizeClass}">${label}</button>
</form>`;
}
