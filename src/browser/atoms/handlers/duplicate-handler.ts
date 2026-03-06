// src/browser/atoms/handlers/duplicate-handler.ts
// Shows an info toast when the duplicate page loads, reminding the user
// to update the Name and Description before saving.

import { showToast } from "../../molecules/ui";

/**
 * Displays a duplicate info notice on the page.
 * Called once when the duplicate form loads — no event listener needed.
 */
export function showDuplicateNotice(): void {
  showToast(
    "Duplicating entry — update the Name and Description before saving.",
    "info",
    8000
  );
}
