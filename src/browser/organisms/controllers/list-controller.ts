// src/browser/organisms/controllers/list-controller.ts
// Wires search filtering and inline delete for the list page.
// Orchestrates: search handler atom + delete handler atom + UI molecules.

import { attachSearchHandler, attachDeleteHandler } from "../../atoms/handlers";
import { setFlashMessage } from "../../sub-atoms/utilities";
import {
  confirmModal,
  showToast,
  showLoading,
  hideLoading,
} from "../../molecules/ui";

export interface ListControllerOptions {
  readonly tableSelector: string;
  readonly rowSelector: string;
  readonly apiBasePath: string;
  readonly redirectUrl: string;
}

/**
 * Initializes list page enhancement.
 * Adds a search input above the table, wires it to filter rows,
 * and intercepts all delete forms to show confirmation + use the JSON API.
 * If the table doesn't exist on the page, does nothing.
 */
export function initListController(options: ListControllerOptions): void {
  const table = document.querySelector<HTMLElement>(options.tableSelector);
  if (!table) return;

  // Insert search input into the toolbar (or fallback to above the table)
  const searchInput = createSearchInput();
  const toolbar = document.querySelector<HTMLElement>(".list-toolbar");
  if (toolbar) {
    toolbar.insertBefore(searchInput, toolbar.firstChild);
  } else {
    const wrapper = table.closest(".table-wrapper");
    if (wrapper) {
      wrapper.insertBefore(searchInput, wrapper.firstChild);
    } else {
      table.parentElement?.insertBefore(searchInput, table);
    }
  }

  attachSearchHandler(searchInput, options.rowSelector);

  // Attach delete handlers to every delete form in the table
  const deleteForms = table.querySelectorAll<HTMLFormElement>("form[action$='/delete']");
  for (const form of deleteForms) {
    const row = form.closest("tr");
    const id = row?.dataset["id"];
    if (!id) continue;

    // Get the entity name from the first cell in the row
    const entityName = row?.querySelector("td")?.textContent?.trim() ?? "this record";

    attachDeleteHandler(form, `${options.apiBasePath}/${id}`, entityName, {
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
}

/** Creates a styled search input element. */
function createSearchInput(): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Search...";
  input.className = "search-input";
  input.setAttribute("aria-label", "Search table");

  // Inline styles — keeps the browser layer self-contained
  input.style.cssText =
    "width:100%; padding:0.5rem 0.75rem; border:1px solid #ccc; " +
    "border-radius:4px; font-size:1rem; margin-bottom:0.75rem;";

  return input;
}
