// src/browser/atoms/handlers/delete-handler.ts
// Intercepts delete form submission to show a confirmation step first.
// Without JS, the form POSTs directly — progressive enhancement adds the prompt.

import { deleteJson } from "../../sub-atoms/utilities";

/** Callbacks the handler uses for UI feedback — provided by the page controller. */
export interface DeleteHandlerCallbacks {
  readonly onConfirm: (entityName: string) => Promise<boolean>;
  readonly onLoading: (loading: boolean) => void;
  readonly onSuccess: () => void;
  readonly onError: (message: string) => void;
}

/**
 * Attaches a submit listener to a delete form.
 * Intercepts the POST, asks for confirmation, then calls the JSON API DELETE endpoint.
 */
export function attachDeleteHandler(
  form: HTMLFormElement,
  apiUrl: string,
  entityName: string,
  callbacks: DeleteHandlerCallbacks
): void {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Ask for confirmation before deleting
    const confirmed = await callbacks.onConfirm(entityName);
    if (!confirmed) return;

    callbacks.onLoading(true);
    try {
      await deleteJson<unknown>(apiUrl);
      callbacks.onSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String((error as Record<string, unknown>)["message"])
            : "Delete failed";
      callbacks.onError(message);
    } finally {
      callbacks.onLoading(false);
    }
  });
}
