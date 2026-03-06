// src/browser/organisms/controllers/detail-controller.ts
// Wires delete confirmation for the detail/show page.
// Orchestrates: delete handler atom + modal molecule + toast molecule.

import { attachDeleteHandler } from "../../atoms/handlers";
import { setFlashMessage } from "../../sub-atoms/utilities";
import {
  confirmModal,
  showToast,
  showLoading,
  hideLoading,
} from "../../molecules/ui";

export interface DetailControllerOptions {
  readonly deleteFormSelector: string;
  readonly apiUrl: string;
  readonly entityName: string;
  readonly redirectUrl: string;
}

/**
 * Initializes detail page enhancement.
 * Intercepts the delete form to show a confirmation modal first.
 * If the delete form doesn't exist on the page, does nothing.
 */
export function initDetailController(options: DetailControllerOptions): void {
  const deleteForm = document.querySelector<HTMLFormElement>(options.deleteFormSelector);
  if (!deleteForm) return;

  attachDeleteHandler(deleteForm, options.apiUrl, options.entityName, {
    onConfirm: (name) =>
      confirmModal("Confirm Delete", `Are you sure you want to delete "${name}"?`),
    onLoading: (loading) => (loading ? showLoading() : hideLoading()),
    onSuccess: () => {
      setFlashMessage("Record deleted successfully", "success");
      window.location.href = options.redirectUrl;
    },
    onError: (message) => {
      showToast(message, "error");
    },
  });
}
