// src/browser/atoms/handlers/form-submit-handler.ts
// Intercepts form submission, validates client-side, submits via fetch.
// Progressive enhancement: if this JS doesn't load, the form still POSTs normally.

import { postJson, putJson } from "../../sub-atoms/utilities";

/** Callbacks the handler uses for UI feedback — provided by the page controller. */
export interface FormSubmitCallbacks {
  readonly onValidate: (form: HTMLFormElement) => string[];
  readonly onErrors: (errors: string[]) => void;
  readonly onLoading: (loading: boolean) => void;
  readonly onSuccess: (data: unknown) => void;
  readonly onError: (message: string) => void;
}

/**
 * Attaches a submit listener to a form element.
 * Prevents the default POST, validates, and submits via JSON API instead.
 * The `apiUrl` should point to the JSON endpoint (e.g. /api/game-domains).
 * The `method` determines whether to POST (create) or PUT (update).
 */
export function attachFormSubmitHandler(
  form: HTMLFormElement,
  apiUrl: string,
  method: "POST" | "PUT",
  callbacks: FormSubmitCallbacks
): void {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Collect all field values from the form, coercing types to match TypeBox schema.
    // FormData always yields strings — number inputs and boolean strings need conversion.
    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (value === "true")  { data[key] = true;  continue; }
      if (value === "false") { data[key] = false; continue; }

      const numEl = form.querySelector<HTMLInputElement>(`input[name="${key}"][type="number"]`);
      if (numEl) {
        // Empty number inputs are omitted entirely — TypeBox t.Number() rejects "" strings.
        if (value !== "") data[key] = Number(value);
        continue;
      }

      // Empty select values mean "no selection" — omit rather than send "" which
      // TypeBox rejects against t.Union([t.Literal("x"), ...]) optional enum schemas.
      const selectEl = form.querySelector<HTMLSelectElement>(`select[name="${key}"]`);
      if (selectEl) {
        if (value !== "") data[key] = value;
        continue;
      }

      // Empty textarea values are omitted — t.Optional(t.String({ minLength: N }))
      // still validates "" against minLength when the key is present.
      const textareaEl = form.querySelector<HTMLTextAreaElement>(`textarea[name="${key}"]`);
      if (textareaEl) {
        if (value !== "") data[key] = value;
        continue;
      }

      data[key] = value;
    }

    // Run client-side validation
    const errors = callbacks.onValidate(form);
    if (errors.length > 0) {
      callbacks.onErrors(errors);
      return;
    }

    // Submit to the JSON API
    callbacks.onLoading(true);
    try {
      const submitFn = method === "POST" ? postJson : putJson;
      const result = await submitFn<unknown>(apiUrl, data);
      callbacks.onSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String((error as Record<string, unknown>)["message"])
            : "An unexpected error occurred";
      callbacks.onError(message);
    } finally {
      callbacks.onLoading(false);
    }
  });
}
