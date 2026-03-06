// src/browser/molecules/ui/modal.ts
// Confirmation dialog that returns a Promise<boolean>.
// Used by the delete handler to ask "Are you sure?" before destructive actions.

import { escapeText, injectStylesOnce } from "../../sub-atoms/utilities";

const MODAL_STYLES = `
  .modal-overlay {
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
  }
  .modal {
    background: white; border-radius: 8px; padding: 2rem;
    max-width: 400px; width: 90%;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  }
  .modal__title {
    font-size: 1.1rem; font-weight: 700; margin-bottom: 0.75rem;
  }
  .modal__body {
    color: #555; margin-bottom: 1.5rem; line-height: 1.4;
  }
  .modal__actions {
    display: flex; gap: 0.75rem; justify-content: flex-end;
  }
  .modal__btn {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    cursor: pointer; font-size: 0.9rem;
  }
  .modal__btn--cancel {
    background: transparent; border: 1px solid #ccc; color: #333;
  }
  .modal__btn--danger {
    background: #dc3545; color: white;
  }
`;

/**
 * Shows a confirmation modal and resolves to true (confirmed) or false (cancelled).
 * The modal is created, shown, and removed entirely in this function — no leftover DOM.
 */
export function confirmModal(title: string, message: string): Promise<boolean> {
  injectStylesOnce("modal", MODAL_STYLES);

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal__title">${escapeText(title)}</div>
        <div class="modal__body">${escapeText(message)}</div>
        <div class="modal__actions">
          <button class="modal__btn modal__btn--cancel" data-action="cancel">Cancel</button>
          <button class="modal__btn modal__btn--danger" data-action="confirm">Delete</button>
        </div>
      </div>`;

    const close = (result: boolean): void => {
      overlay.remove();
      resolve(result);
    };

    // Handle button clicks
    overlay.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.dataset["action"] === "confirm") close(true);
      if (target.dataset["action"] === "cancel") close(false);
    });

    // Close on overlay background click
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(false);
    });

    // Close on Escape key
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        document.removeEventListener("keydown", handleKey);
        close(false);
      }
    };
    document.addEventListener("keydown", handleKey);

    document.body.appendChild(overlay);
  });
}
