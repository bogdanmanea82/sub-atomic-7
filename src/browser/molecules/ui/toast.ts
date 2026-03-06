// src/browser/molecules/ui/toast.ts
// Temporary notification messages that appear and auto-dismiss.
// Creates its own container element on first use — no server-rendered HTML needed.
// Supports a dismiss button and configurable display duration.

import { injectStylesOnce } from "../../sub-atoms/utilities";

/** Visual style of the toast notification. */
export type ToastType = "success" | "error" | "info";

const CONTAINER_ID = "toast-container";
const FADE_DURATION_MS = 300;
const DEFAULT_DURATION_MS = 5000;

/** CSS injected once when the first toast is shown. */
const TOAST_STYLES = `
  #${CONTAINER_ID} {
    position: fixed; top: 1rem; right: 1rem; z-index: 9999;
    display: flex; flex-direction: column; gap: 0.5rem;
    pointer-events: none;
  }
  .toast {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1.25rem; border-radius: 6px; font-size: 0.9rem;
    color: white; pointer-events: auto; opacity: 1;
    transition: opacity ${FADE_DURATION_MS}ms ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    max-width: 420px;
  }
  .toast__message { flex: 1; }
  .toast__dismiss {
    background: none; border: none; color: rgba(255,255,255,0.8);
    cursor: pointer; font-size: 1.1rem; padding: 0 0.25rem; line-height: 1;
  }
  .toast__dismiss:hover { color: white; }
  .toast--success { background: #28a745; }
  .toast--error   { background: #dc3545; }
  .toast--info    { background: #17a2b8; }
  .toast--fade-out { opacity: 0; }
`;

/** Ensures the toast container and styles exist in the DOM. */
function getContainer(): HTMLElement {
  let container = document.getElementById(CONTAINER_ID);
  if (container) return container;

  injectStylesOnce("toast", TOAST_STYLES);

  container = document.createElement("div");
  container.id = CONTAINER_ID;
  document.body.appendChild(container);
  return container;
}

/** Fades out and removes a toast element from the DOM. */
function dismissToast(toast: HTMLElement, timerId: ReturnType<typeof setTimeout>): void {
  clearTimeout(timerId);
  toast.classList.add("toast--fade-out");
  setTimeout(() => toast.remove(), FADE_DURATION_MS);
}

/**
 * Shows a toast notification that auto-dismisses after `durationMs`.
 * Includes a dismiss button (×) to close it immediately.
 * Multiple toasts stack vertically in the top-right corner.
 */
export function showToast(
  message: string,
  type: ToastType = "info",
  durationMs: number = DEFAULT_DURATION_MS
): void {
  const container = getContainer();

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const messageSpan = document.createElement("span");
  messageSpan.className = "toast__message";
  messageSpan.textContent = message;

  const dismissBtn = document.createElement("button");
  dismissBtn.className = "toast__dismiss";
  dismissBtn.innerHTML = "&times;";
  dismissBtn.setAttribute("aria-label", "Dismiss");

  toast.appendChild(messageSpan);
  toast.appendChild(dismissBtn);
  container.appendChild(toast);

  // Auto-remove after duration
  const timerId = setTimeout(() => dismissToast(toast, timerId), durationMs);

  // Dismiss button bypasses the timer
  dismissBtn.addEventListener("click", () => dismissToast(toast, timerId));
}
